package com.example.api.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api")
public class WebPageController {


    @GetMapping()
    public String  goToIndexPage(){
        return "index";
    }
    
}
