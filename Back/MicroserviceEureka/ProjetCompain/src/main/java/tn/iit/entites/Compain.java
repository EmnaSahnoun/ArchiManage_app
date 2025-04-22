package tn.iit.entites;

import java.util.Date;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "companies") // Spécifie le nom de la collection MongoDB
@Data // Lombok - génère getters, setters, toString, etc.
public class Compain{
    @Id // Identifiant unique MongoDB
    private String id;
    
    private String name;
    private String address;
    private String email;
    private String phone;
    private Date createdAt = new Date(); // Initialisé avec la date actuelle par défaut
}
