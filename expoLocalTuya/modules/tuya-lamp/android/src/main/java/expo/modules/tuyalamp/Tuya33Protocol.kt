package expo.modules.tuyalamp

import java.io.DataInputStream
import java.nio.ByteBuffer
import java.util.zip.CRC32
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec

internal class Tuya33Protocol(localKey: String) {
  private val key = SecretKeySpec(localKey.toByteArray(Charsets.ISO_8859_1), "AES")

  init {
    require(key.encoded.size == 16) { "Tuya local key must contain 16 bytes." }
  }

  data class Response(val command: Int, val returnCode: Int, val payload: ByteArray)

  fun encode(sequence: Int, command: Int, json: String): ByteArray {
    val encrypted = cipher(Cipher.ENCRYPT_MODE).doFinal(json.toByteArray(Charsets.UTF_8))
    val payload = if (command == UPDATEDPS) encrypted else VERSION_HEADER + encrypted
    val buffer = ByteBuffer.allocate(16 + payload.size + 8)
      .putInt(PREFIX).putInt(sequence).putInt(command).putInt(payload.size + 8).put(payload)
    val crc = CRC32().apply { update(buffer.array(), 0, buffer.position()) }.value
    buffer.putInt(crc.toInt()).putInt(SUFFIX)
    return buffer.array()
  }

  fun read(input: DataInputStream): Response {
    // TCP reads may split a frame. readFully waits for every required byte.
    val header = ByteArray(16).also(input::readFully)
    val buffer = ByteBuffer.wrap(header)
    require(buffer.int == PREFIX) { "Invalid Tuya response prefix." }
    buffer.int // sequence
    val command = buffer.int
    val length = buffer.int
    require(length in 12..65536) { "Invalid Tuya response length." }
    val body = ByteArray(length).also(input::readFully)
    val tail = ByteBuffer.wrap(body, length - 8, 8)
    val checksum = tail.int.toLong() and 0xffffffffL
    require(tail.int == SUFFIX) { "Invalid Tuya response suffix." }
    val crc = CRC32().apply {
      update(header)
      update(body, 0, length - 8)
    }.value
    require(crc == checksum) { "Tuya response checksum failed." }
    return Response(command, ByteBuffer.wrap(body).int, body.copyOfRange(4, length - 8))
  }

  fun decrypt(payload: ByteArray): String {
    val hasVersionHeader = payload.size >= 15 &&
      payload[0] == '3'.code.toByte() && payload[1] == '.'.code.toByte() &&
      payload[2] == '3'.code.toByte()
    val encrypted = if (hasVersionHeader) payload.copyOfRange(15, payload.size) else payload
    require(encrypted.isNotEmpty() && encrypted.size % 16 == 0) { "Invalid Tuya ciphertext." }
    return cipher(Cipher.DECRYPT_MODE).doFinal(encrypted).toString(Charsets.UTF_8)
  }

  private fun cipher(mode: Int) = Cipher.getInstance("AES/ECB/PKCS5Padding").apply {
    init(mode, key)
  }

  companion object {
    const val CONTROL = 7
    const val UPDATEDPS = 18
    private const val PREFIX = 0x55aa
    private const val SUFFIX = 0xaa55
    private val VERSION_HEADER = "3.3".toByteArray(Charsets.US_ASCII) + ByteArray(12)
  }
}
