package org.oji.shgl.contact.service;

import org.oji.shgl.dto.ContactRequestDto;

public interface IContactService {
    String saveContact(ContactRequestDto contactRequestDto);
}
