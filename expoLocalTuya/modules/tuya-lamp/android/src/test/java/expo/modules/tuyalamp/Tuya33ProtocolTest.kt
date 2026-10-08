package expo.modules.tuyalamp

import java.io.ByteArrayInputStream
import java.io.DataInputStream
import java.nio.ByteBuffer
import java.util.zip.CRC32
import org.junit.Assert.*
import org.junit.Test

class Tuya33ProtocolTest {
  private val protocol = Tuya33Protocol("0123456789abcdef")
  private val json = "{\"dpId\":[20,21,22,23]}"

  @Test
  fun refreshMatchesTinyTuya118Frame() {
    // Independent vector generated with TinyTuya 1.18.0, AES encryption and pack_message.
    val expected = "000055aa000000010000001200000028e34176cd3965ac6df606b4cec71ac2961b4f292c9d111008c1eaf9db0e2636f55303eda90000aa55"
    assertArrayEquals(hex(expected), protocol.encode(1, Tuya33Protocol.UPDATEDPS, json))
  }

  @Test
  fun controlIncludesVersionHeaderAndDecrypts() {
    val frame = protocol.encode(2, Tuya33Protocol.CONTROL, json)
    assertArrayEquals("3.3".toByteArray() + ByteArray(12), frame.copyOfRange(16, 31))
    assertEquals(json, protocol.decrypt(frame.copyOfRange(16, frame.size - 8)))
  }

  @Test
  fun readsFragmentedResponseAndReturnCode() {
    val frame = response()
    val stream = object : ByteArrayInputStream(frame) {
      override fun read(buffer: ByteArray, offset: Int, length: Int): Int =
        super.read(buffer, offset, minOf(length, 2))
    }
    val result = protocol.read(DataInputStream(stream))
    assertEquals(8, result.command)
    assertEquals(0, result.returnCode)
    assertEquals(json, protocol.decrypt(result.payload))
  }

  @Test(expected = IllegalArgumentException::class)
  fun rejectsCorruptChecksum() {
    val frame = response()
    frame[22] = (frame[22].toInt() xor 1).toByte()
    protocol.read(DataInputStream(ByteArrayInputStream(frame)))
  }

  @Test(expected = IllegalArgumentException::class)
  fun rejectsOversizedFrameBeforeReadingBody() {
    val header = ByteBuffer.allocate(16).putInt(0x55aa).putInt(1).putInt(8).putInt(Int.MAX_VALUE).array()
    protocol.read(DataInputStream(ByteArrayInputStream(header)))
  }

  private fun response(): ByteArray {
    val request = protocol.encode(1, Tuya33Protocol.UPDATEDPS, json)
    val payload = request.copyOfRange(16, request.size - 8)
    val buffer = ByteBuffer.allocate(16 + 4 + payload.size + 8)
      .putInt(0x55aa).putInt(1).putInt(8).putInt(payload.size + 12).putInt(0).put(payload)
    val crc = CRC32().apply { update(buffer.array(), 0, buffer.position()) }.value
    return buffer.putInt(crc.toInt()).putInt(0xaa55).array()
  }

  private fun hex(value: String): ByteArray = value.chunked(2).map { it.toInt(16).toByte() }.toByteArray()
}
