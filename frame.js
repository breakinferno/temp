/**
*
  0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-------+-+-------------+-------------------------------+
 |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
 |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
 |N|V|V|V|       |S|             |   (if payload len==126/127)   |
 | |1|2|3|       |K|             |                               |
 +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
 |     Extended payload length continued, if payload len == 127  |
 + - - - - - - - - - - - - - - - +-------------------------------+
 |                               |Masking-key, if MASK set to 1  |
 +-------------------------------+-------------------------------+
 | Masking-key (continued)       |          Payload Data         |
 +-------------------------------- - - - - - - - - - - - - - - - +
 :                     Payload Data continued ...                :
 + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
 |                     Payload Data continued ...                |
 +---------------------------------------------------------------+
*
*/
 // 控制位: FIN, Opcode, MASK, Payload_len
  var preBytes = [], 
      payBytes = new Buffer('test websocket'), 
      mask = 0;
      masking_key = Buffer.randomByte(4);

  var dataLength = payBytes.length;

  // 构建Frame的第一字节
  preBytes.push((frame['FIN'] << 7) + frame['Opcode']);

  // 处理不同长度的dataLength，构建Frame的第二字节（或第2～第8字节）
  // 注意这里以大端字节序构建dataLength > 126的dataLenght
  if (dataLength < 126) {
    preBytes.push((frame['MASK'] << 7) + dataLength);
  } else if (dataLength < 65536) {
    preBytes.push(
      (frame['MASK'] << 7) + 126, 
      (dataLength & 0xFF00) >> 8,
      dataLength & 0xFF
    );
  } else {
    preBytes.push(
      (frame['MASK'] << 7) + 127,
      0, 0, 0, 0,
      (dataLength & 0xFF000000) >> 24,
      (dataLength & 0xFF0000) >> 16,
      (dataLength & 0xFF00) >> 8,
      dataLength & 0xFF
    );
  }

  preBytes = new Buffer(preBytes);

  // 如果有掩码，就对数据进行加密，并构建之后的控制位
  if (mask) {
    preBytes = Buffer.concat([preBytes, masking_key]);
    for (var i = 0; i < dataLength; i++) 
      payBytes[i] ^= masking_key[i % 4];
  }

  // 生成一个Frame
  var frame = Buffer.concat([preBytes, payBytes]);

