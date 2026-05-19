package org.oji.shgl.contact.service.impl;

import lombok.RequiredArgsConstructor;
import org.oji.shgl.contact.service.IContactService;
import org.oji.shgl.dto.ContactRequestDto;
import org.oji.shgl.entity.Contact;
import org.oji.shgl.mapper.ContactMapper;
import org.oji.shgl.repository.ContactRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ContactService implements IContactService
{
    private final ContactRepository contactRepository;
    private final ContactMapper contactMapper;
    @Override
    public String saveContact(ContactRequestDto contactRequestDto)
    {
        Contact contact = contactMapper.toEntity(contactRequestDto);
        contactRepository.save(contact);
        if(contact.getId() != null)
            return "Message sent successfully";
        return "Message not sent";
    }
}
