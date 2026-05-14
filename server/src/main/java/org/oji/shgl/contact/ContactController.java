package org.oji.shgl.contact;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.oji.shgl.contact.service.impl.ContactService;
import org.oji.shgl.dto.ContactRequestDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("contacts")
@RequiredArgsConstructor
public class ContactController {
    private final ContactService contactService;

    @PostMapping(version = "1.0")
    public ResponseEntity<String> saveContact(@RequestBody @Valid ContactRequestDto contactRequestDto) {
        String result = contactService.saveContact(contactRequestDto);
        return ResponseEntity.ok(result);
    }
}
