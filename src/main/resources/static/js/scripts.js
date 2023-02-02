

function getFormatedDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milisecs = String(now.getMilliseconds()).padStart(3, '0');

    return "" + year + month + day + hour + minutes + seconds + milisecs;

}



/**
 * 
 * @param {*} url 
 * @param {*} body 
 * @param {*} method 
 * @param {*} headers 
 * @returns 
 */
async function sendData(url,
    body = "",
    method = "POST",
    headers = { 'Content-Type': 'application/json' }
) {

    try {
        const response = await fetch(url, { method, body, headers });
        const data = await response.text();
        return data;
    } catch (error) {
        console.error("### Error is " + error);
        throw error;
    }
}

/**
 * 
 * @param {*} fileElementId 
 * @returns 
 */
function getSimpleFile(fileElementId) {
    const file = document.getElementById(fileElementId).files[0];
    console.log(`the file is  ${file}`);
    console.log(`the name is  ${file.name}`);
    return file;
}

/**
 * 
 * @param {*} fileElementId 
 * @param {*} appendedFileName 
 * @returns 
 */
function getFormData(fileElementId, appendedFileName) {
    const userFile = getSimpleFile(fileElementId);
    const formData = new FormData();
    formData.append(appendedFileName, userFile, userFile.name);
    return formData;
}


/**
 * 
 * @param {*} file 
 * @returns 
 */
async function getBytesFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const fileByteArray = [];
        reader.readAsArrayBuffer(file);
        reader.onloadend = (evt) => {
            if (evt.target.readyState == FileReader.DONE) {
                const arrayBuffer = evt.target.result;
                const array = new Uint8Array(arrayBuffer);
                const size = array.length;
                console.log(`size is ${size}`);

                for (let index = 0; index < size; index++) {
                    fileByteArray.push(array[index]);
                }
                resolve(fileByteArray);
            }
        };
        reader.onerror = error => reject(error);
    });
}

/**
 * 
 * @param {*} file 
 * @returns 
 */
async function getBase64FromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result
                .replace('data', '')
                .replace(/^.+,/, '');
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
}

/**
 * 
 * @param {*} file 
 * @param {*} chunkSize 
 * @returns 
 */
async function getChuncksFromBase64(file, chunkSize) {
    try {
        const stringBase64 = await getBase64FromFile(file);
        return stringBase64.match(new RegExp('.{1,' + chunkSize + '}', 'g'));
    } catch (error) {
        console.error(error);
    }
}


async function clickToUploadFile() {
    const URL = "http://localhost:3000/upload";
    const formData = getFormData('userFile', 'userFile');
    await sendData(URL, formData, "POST");
}

async function clickToUploadBase64() {
    const userFile = getSimpleFile('userFile');
    const originalFileName = userFile.name;
    const URL = "http://localhost:8080/api/document/base64";
    try {
        const stringBase64 = await getBase64FromFile(userFile);
        console.log(`size of base64 is ${stringBase64.length}`);
        console.log(stringBase64);
        const formatedDate = getFormatedDate();
        const fileName = `${formatedDate}_${originalFileName}_demoFileBase64.txt`;

        const payload = JSON.stringify({ stringBase64, fileName });
        await sendData(URL, payload);
    } catch (error) {
        console.error(error);
    }
}


async function clickToUploadBytes() {
    const userFile = getSimpleFile('userFile');
    const fileName = userFile.name;
    const URL = "http://localhost:8080/api/document/byteArray";
    try {
        const byteArray = await getBytesFromFile(userFile);
        const payload = JSON.stringify({ byteArray, fileName });
        await sendData(URL, payload);
        console.log(`size of the byte array is  ${byteArray.length} `);
        console.table(byteArray);
    } catch (error) {
        console.error(error);
    }
}

async function clickToUploadInChunks() {
    try {
        const userFile = getSimpleFile('userFile');
        const chunkArray = await getChuncksFromBase64(userFile, 250000);
        console.log(`size is ${chunkArray.length}`);
        console.table(chunkArray);

        const uploadPromiseArray = chunkArray.map((stringBase64, index) => {
            return new Promise((resolve, reject) => {
                const URL = "http://localhost:8080/api/document/base64";
                const body = JSON.stringify({ stringBase64, fileName: `demoFileBase64Chunk_${index}.txt` });
                const headers = { 'Content-Type': 'application/json' };
                fetch(URL, { method: "POST", body, headers })
                    .then(response => response.text())
                    .then(text => resolve(text))
                    .catch(() => reject(new Error("Error to create the file")));
            });
        });

        console.log(uploadPromiseArray)

        Promise.allSettled(uploadPromiseArray)
            .then(values => {
                console.table(values);
                values.forEach(current => console.log(current))
                console.log("done");
            });

    } catch (error) {
        console.log(error);
    }
}


async function clickToJoinChunks() {
    try {
        const URL = "http://localhost:8080/api/document/buildFile";
        const fileName = "AllContentInBase64.txt";
        const fileNameList = ["demoFileBase64Chunk_0.txt",
            "demoFileBase64Chunk_1.txt", "demoFileBase64Chunk_2.txt", "demoFileBase64Chunk_3.txt", "demoFileBase64Chunk_4.txt",
            "demoFileBase64Chunk_5.txt", "demoFileBase64Chunk_6.txt"];
        const payload = JSON.stringify({ fileNameList, fileName });
        await sendData(URL, payload);
    } catch (error) {
        console.log(error);
    }
}


async function clickToChangeBase64ToFile() {
    try {

        const URL = `http://localhost:8080/api/document/changeBase64FileToBytes`;
        const base64FileName = "AllContentInBase64.txt";
        const bytesFileName = "AllWallpaperBytes.jpg";
        const payload = JSON.stringify({ base64FileName, bytesFileName });
        await sendData(URL, payload);
    } catch (error) {
        console.log(error);
    }
}


async function downloadPdfFile(){
    
    const URL = `http://localhost:8080/api/document/downloadFromFileSystem`;
    window.open( URL, "_blank");  


}

async function clickToOpenKubernetesFile(){
    const endPoint  = `http://localhost:8080/api/document/downloadBytesInString`;
    const response = await fetch( endPoint );
    const stringInUtf8 = await response.text();

    console.log( "byteData length: ", stringInUtf8.length ); 
   console.log( "byteData", stringInUtf8);

    
    
   
    const linkSource = `application/pdf;charset=utf-8,${stringInUtf8}`;
    const downloadLink = document.createElement("a");
    const fileName = "abc.pdf";
    downloadLink.href = linkSource;
    downloadLink.target = "_blank";
    downloadLink.download = fileName;
    downloadLink.click();
   

}




function init() {
    //document.getElementById('uploadBtn').addEventListener('click', clickToUploadFile);
    // TODO:  Fix and create a new Rest Controller method to upload the file with springboot
    document.getElementById('uploadBtn').disabled = true;


    document.getElementById('uploadBase64Btn').addEventListener("click", clickToUploadBase64);
    document.getElementById('uploadBytesBtn').addEventListener("click", clickToUploadBytes);

    //TODO:  Fix the methods to identify the right file refernce.
    /*
    document.getElementById('uploadByChunksBtn').addEventListener("click", clickToUploadInChunks);
    document.getElementById('joinChunksInFileBtn').addEventListener("click", clickToJoinChunks );
    document.getElementById('changeBase64ToFile').addEventListener("click", clickToChangeBase64ToFile );
    */
    document.getElementById('uploadByChunksBtn').disabled = true;
    document.getElementById('joinChunksInFileBtn').disabled = true;
    document.getElementById('changeBase64ToFile').disabled = true;

    document.getElementById('downloadKubernetesFile').addEventListener("click", downloadPdfFile);

    document.getElementById('openKubernetesFile').addEventListener("click",  clickToOpenKubernetesFile );
    

}

init();
