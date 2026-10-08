package expo.modules.tuyalamp

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TuyaLampModule : Module() {
  private val client = TuyaLampClient()

  override fun definition() = ModuleDefinition {
    Name("TuyaLamp")

    AsyncFunction("getStatus") { client.getStatus() }
    AsyncFunction("setPower") { isOn: Boolean -> client.setPower(isOn) }
    AsyncFunction("setBrightness") { brightness: Int -> client.setBrightness(brightness) }
    AsyncFunction("setTemperature") { temperature: Int -> client.setTemperature(temperature) }
  }
}
