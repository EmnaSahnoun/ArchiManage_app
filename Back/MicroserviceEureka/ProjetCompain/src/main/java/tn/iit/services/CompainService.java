package tn.iit.services;

import java.util.List;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import tn.iit.entites.Compain;
import tn.iit.exception.CompainNotFoundException;
import tn.iit.repositories.CompainRepository;

@RequiredArgsConstructor
@Service
@Transactional
public class CompainService {
	private final CompainRepository compainRepository;

	
	
	public Compain saveOrUpdate(Compain compain) {
	
		return compainRepository.save(compain);
	
	} 
	public List<Compain> findAll() {

		return compainRepository.findAll();

	}
	
	public Compain getById(Long id) throws CompainNotFoundException {

		return compainRepository.findById(id).orElseThrow(() -> new CompainNotFoundException(id + " compain Not Found"));

	}
	
	public void delete(Long id) {

		compainRepository.deleteById(id);

	}
	
	
	
	

}
