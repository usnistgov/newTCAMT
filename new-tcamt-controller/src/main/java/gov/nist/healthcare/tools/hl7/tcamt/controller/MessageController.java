package gov.nist.healthcare.tools.hl7.tcamt.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import gov.nist.healthcare.tools.hl7.v2.tcamt.domain.Message;
import gov.nist.helthcare.tools.hl7.v2.tcamt.repo.MessageRepository;
@Controller
public class MessageController {
	@Autowired
	private MessageRepository messageRepository;
	
	
	@RequestMapping(value = "/messages", method = RequestMethod.GET)
	public List<Message> getMessages(){
		System.out.println("i am here");
		return messageRepository.findAll();
	}
	
	

	
	
	
}







