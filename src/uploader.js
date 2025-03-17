const Uploader = (function() {
  const FALLBACK_CHUNK_SIZE = 1048576; // 1MB
  const MAX_F01_ELEMENT_SIZE = 30000;

  generateRandom10DigitInteger = () => Math.floor(1000000000 + Math.random() * 9000000000);

  //builds a js array from long string
  clob2Array = (pClob, pSize) => {
    const rArray = [];
    const loopCount = Math.floor(pClob.length / pSize) + 1;
    for (let i = 0; i < loopCount; i++) {
        rArray.push(pClob.slice(pSize * i, pSize * (i + 1)));
    }
    return rArray;
  };

  //converts binaryArray to base64 string
  binaryArray2base64 = (pInt8Array) => {
    let data = '';
    const bytes = new Uint8Array(pInt8Array);
    for (let i = 0; i < bytes.byteLength; i++) {
      data += String.fromCharCode(bytes[i]);
    }
    return btoa(data);
  };

  uploadChunk = (uploadId, pChunk, pFile, pCurrentChunk, pFileChunkCount) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileChunkBase64 = binaryArray2base64(e.target.result);
        const f01Array = clob2Array(fileChunkBase64, MAX_F01_ELEMENT_SIZE);
        console.log(`Uploading chunk ${pCurrentChunk + 1}/${pFileChunkCount} of ${pFile.name}`);
        console.log('This is the place to call the API to upload the chunk, parameters: uploadId, name, type, currentchung, totalchunks, array', uploadId, pFile.name, pFile.type, pCurrentChunk, pFileChunkCount, f01Array);
        //simulated api call
        setTimeout(() => {
          if (Math.random() < 0.9) {
            console.log(`Chunk ${pCurrentChunk + 1} uploaded successfully`);
            resolve();
          } else {
            console.log(`Chunk ${pCurrentChunk + 1} upload failed`);
            reject();
          }
        }, 100);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(pChunk);
    });
  };

  uploadFileChunked = async (pFile, pChunkSize) => {
    const uploadId = generateRandom10DigitInteger();
    const chunkSize = pChunkSize || FALLBACK_CHUNK_SIZE;
    const fileChunkCount = Math.ceil(pFile.size / chunkSize);
    const uploadPromises = [];
    
    for (let currentChunk=0; currentChunk < fileChunkCount; currentChunk++) {
      const chunkStart = currentChunk * chunkSize;
      const chunkEnd = ((chunkStart + chunkSize) >= pFile.size) ? pFile.size : chunkStart + chunkSize;
      const fileChunk = pFile.slice(chunkStart, chunkEnd);
      uploadPromises.push(uploadChunk(uploadId, fileChunk, pFile, currentChunk, fileChunkCount));
    }
    
    try {
      await Promise.all(uploadPromises);
      console.log(`All chunks uploaded for ${pFile.name}. Sending finalize request...`);
      // Simulated finalize API request
      setTimeout(() => {
        console.log(`Finalize request sent for ${pFile.name}`);
      }, 100);
    } catch (err) {
      console.log(`Upload failed for ${pFile.name}`);
      // Simulated abandon API request
      setTimeout(() => {
        console.log(`Abandon request sent for ${pFile.name}`);
      }, 100);
    }
    
  }

  uploadFilesChunked = (pFiles, pChunkSize) => {
    console.log('uploading files...', pFiles.length);
    for (const file of pFiles) {
        uploadFileChunked(file, pChunkSize);
    }
  };

  return {
    uploadFilesChunked
  }
})();
