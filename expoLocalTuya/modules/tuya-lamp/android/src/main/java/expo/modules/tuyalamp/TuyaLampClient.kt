package expo.modules.tuyalamp

import java.io.DataInputStream
import java.net.InetSocketAddress
import java.net.Socket
import org.json.JSONArray
import org.json.JSONObject

internal class TuyaLampClient {
  private val protocol = Tuya33Protocol(LampConfig.LOCAL_KEY)
  private var sequence = 1

  init {
    require(LampConfig.VERSION == "3.3") { "This client supports Tuya 3.3 only." }
  }

  @Synchronized
  fun getStatus(): Map<String, Any> = state(query())

  @Synchronized
  fun setPower(isOn: Boolean): Map<String, Any> = update(JSONObject().put("20", isOn))

  @Synchronized
  fun setBrightness(brightness: Int): Map<String, Any> {
    require(brightness in 10..1000) { "Brightness must be between 10 and 1000." }
    return update(JSONObject().put("21", "white").put("22", brightness))
  }

  @Synchronized
  fun setTemperature(temperature: Int): Map<String, Any> {
    require(temperature in 0..1000) { "Temperature must be between 0 and 1000." }
    return update(JSONObject().put("21", "white").put("23", temperature))
  }

  private fun update(dps: JSONObject): Map<String, Any> {
    val request = JSONObject().put("devId", LampConfig.DEVICE_ID)
      .put("uid", LampConfig.DEVICE_ID)
      .put("t", (System.currentTimeMillis() / 1000).toString()).put("dps", dps)
    exchange(Tuya33Protocol.CONTROL, request)
    repeat(3) { attempt ->
      val status = query()
      if (dps.keys().asSequence().all { status.opt(it) == dps.get(it) }) return state(status)
      if (attempt < 2) Thread.sleep(150)
    }
    error("The lamp did not confirm the change. Refresh to check its state.")
  }

  private fun query(): JSONObject {
    val response = exchange(Tuya33Protocol.UPDATEDPS,
      JSONObject().put("dpId", JSONArray(listOf(20, 21, 22, 23))))
    val json = JSONObject(response)
    val dps = json.optJSONObject("dps") ?: json.optJSONObject("data")?.optJSONObject("dps")
    check(dps != null && listOf("20", "22", "23").all(dps::has)) {
      "The lamp did not return its power, brightness, and white temperature."
    }
    return dps
  }

  private fun exchange(command: Int, request: JSONObject): String {
    return Socket().use { socket ->
      socket.connect(InetSocketAddress(LampConfig.DEVICE_IP, LampConfig.PORT), 4000)
      socket.soTimeout = 4000
      socket.tcpNoDelay = true
      val output = socket.getOutputStream()
      output.write(protocol.encode(sequence++, command, request.toString()))
      output.flush()
      val input = DataInputStream(socket.getInputStream())
      repeat(8) {
        val response = protocol.read(input)
        if (response.command == command || response.command == 8) {
          check(response.returnCode == 0) { "The lamp rejected the command (${response.returnCode})." }
          if (response.payload.isNotEmpty()) return@use protocol.decrypt(response.payload)
          if (command == Tuya33Protocol.CONTROL && response.command == command) return@use "{}"
        }
      }
      error("No Tuya response received.")
    }
  }

  private fun state(dps: JSONObject): Map<String, Any> {
    val brightness = dps.getInt("22")
    val temperature = dps.getInt("23")
    check(brightness in 10..1000 && temperature in 0..1000) { "The lamp returned invalid values." }
    return mapOf("isOn" to dps.getBoolean("20"), "temperature" to temperature,
      "brightness" to brightness)
  }
}
