package tn.iit.controller; import org.springframework.web.bind.annotation.ResponseStatus; import java.util.List; import 
org.springframework.http.HttpStatus; import org.springframework.web.bind.annotation.DeleteMapping; import 
org.springframework.web.bind.annotation.GetMapping; import org.springframework.web.bind.annotation.PathVariable; import 
org.springframework.web.bind.annotation.PostMapping; import org.springframework.web.bind.annotation.PutMapping; import 
org.springframework.web.bind.annotation.RequestBody; import org.springframework.web.bind.annotation.RestController; import 
org.springframework.web.bind.annotation.CrossOrigin; import lombok.AllArgsConstructor; import tn.iit.entites.Compain; import 
tn.iit.exception.CompainNotFoundException; import tn.iit.services.CompainService;

import org.springframework.security.access.prepost.PreAuthorize;



@RestController @AllArgsConstructor public class CompainController {

	private final CompainService compainService;
        @ResponseStatus(HttpStatus.OK)
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
	@GetMapping("/compain")
     	public List<Compain> comptes() {
		return compainService.findAll();
	}

	@GetMapping("/compain/{id}")
	public Compain getCompteByRib(@PathVariable(name = "id") Long id) throws CompainNotFoundException {
		return compainService.getById(id);
	}

	@DeleteMapping("/compain/delete/{id}")
	public void deleteCompteCompain(@PathVariable("id") Long id) throws CompainNotFoundException {
		compainService.delete(id);
	}

	@PostMapping("/compain/add")
	public Compain saveCompte(@RequestBody Compain compain) {

		return compainService.saveOrUpdate(compain);

	}

	@GetMapping("/compain/{id}/edit")
	public Compain getCompainForEdit(@PathVariable("id") Long id) throws CompainNotFoundException {
		// Récupérer le client par son ID
		return compainService.getById(id);
	}

	@PutMapping("/compain/{id}")
	public Compain updateCompain(@PathVariable("id") Long id, @RequestBody Compain updatedCompain)
			throws CompainNotFoundException {
		Compain existingCmpain = compainService.getById(id);
		existingCmpain.setReference(updatedCompain.getReference());
		existingCmpain.setName(updatedCompain.getName());
		existingCmpain.setCountry(updatedCompain.getCountry());
		existingCmpain.setTown(updatedCompain.getTown());
		existingCmpain.setAdress(updatedCompain.getAdress());
		existingCmpain.setPc(updatedCompain.getPc());
		existingCmpain.setCreatedAt(updatedCompain.getCreatedAt());

		return compainService.saveOrUpdate(existingCmpain);
	}

}
