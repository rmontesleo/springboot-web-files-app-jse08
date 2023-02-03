package com.example.api.controllers;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.api.dtos.BuildBase64ToBytesRequest;
import com.example.api.dtos.BuildOrderRequest;
import com.example.api.dtos.DocumentResponse;
import com.example.api.dtos.ItemBase64Request;
import com.example.api.dtos.ItemByteArrayRequest;
import com.example.api.services.DocumentService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@RestController
@RequestMapping("/document")
@AllArgsConstructor
@Slf4j
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public String ping(){
        return "ping";
    }

    private ResponseEntity<DocumentResponse> getDocumentResponse( Optional<DocumentResponse> optionalDocumentResponse ){
        return optionalDocumentResponse
            .map( response -> ResponseEntity.status( HttpStatus.CREATED ).body( response ) )
            .orElseThrow( () -> new RuntimeException() );
    }


    @PostMapping("/base64")
    public ResponseEntity<DocumentResponse> postSimpleBase64( @RequestBody ItemBase64Request requestBody ) {
        log.debug(  "Request Body is "  );
        return  getDocumentResponse ( documentService.createSingleFileFromBase64( requestBody ) );
    }

    @PostMapping("/byteArray")
    public ResponseEntity<DocumentResponse> postSimpleByteArray( @RequestBody ItemByteArrayRequest requestBody ){
        log.debug( "Request body of byte array" );
        return getDocumentResponse( documentService.createDocumentFromBytes(requestBody) );
    }


    @PostMapping("/buildFile")
    public ResponseEntity<DocumentResponse> buildFile(@RequestBody BuildOrderRequest requestBody ){
        log.debug("Request the build of the file of base64..");
        requestBody.getFileNameList().forEach(System.out::print);
        return getDocumentResponse( documentService.joinBase64Files(requestBody) );
    }


    @PostMapping("/changeBase64FileToBytes")
    public ResponseEntity<DocumentResponse> getMethodName(@RequestBody BuildBase64ToBytesRequest requestBody  ) {
        log.debug("Change the Base64 file to create a file from bytes");
        return getDocumentResponse ( documentService.createByteFileFromBase64(requestBody) );
    }   


    @GetMapping("/downloadPDF")
    public ResponseEntity<Void> downloadKubernetesFile() throws IOException {
        final String filePath = "D:\\files\\1_Intro_to_Kubernetes.pdf";
        byte[] fileBytes = Files.readAllBytes(Paths.get(filePath)  );

        try( ByteArrayInputStream inputStream = new ByteArrayInputStream( fileBytes ) ) {
            File destinationFile = new File("test.pdf");
            try (OutputStream output = new FileOutputStream(destinationFile)) {
                byte[] buffer = new byte[fileBytes.length];
                int read;
                while((read = inputStream.read(buffer)) > -1){
                    output.write(buffer, 0, read);
                }
            }
        }

        return ResponseEntity.status(200).build();
    }


    @GetMapping("/downloadFromFileSystem")
    public ResponseEntity<?> downloadImageFromFileSystem() throws IOException {
        final String filePath = "D:\\files\\1_Intro_to_Kubernetes.pdf";
        byte[] fileBytes = Files.readAllBytes(Paths.get(filePath)  );

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.valueOf("application/pdf"))
                .body(fileBytes);

    }

    @GetMapping("/downloadBytesInStringUTF8")
    public ResponseEntity<String> downloadBytesInStringUtf8() throws IOException {
        final String filePath = "D:\\files\\1_Intro_to_Kubernetes.pdf";
        byte[] fileBytes = Files.readAllBytes(Paths.get(filePath)  );
        String bytesInStringUtf8 = new String(fileBytes, StandardCharsets.UTF_8 );

        return ResponseEntity.status(HttpStatus.OK)
                .body(bytesInStringUtf8);

    }

    @GetMapping("/downloadBytesInStringBase64")
    public ResponseEntity<String> downloadBytesInStringBase64() throws IOException {
        final String filePath = "D:\\files\\1_Intro_to_Kubernetes.pdf";
        byte[] fileBytes = Files.readAllBytes(Paths.get(filePath)  );
        String bytesInStringBase64 = Base64.getEncoder().encodeToString(fileBytes);

        return ResponseEntity.status(HttpStatus.OK)
                .body(bytesInStringBase64);

    }


}
