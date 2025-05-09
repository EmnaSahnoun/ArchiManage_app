package tn.iit.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CompainRequest {
    @NotBlank(message = "Name is mandatory")
    private String name;

    private String address;

    @Email(message = "Email should be valid")
    private String email;


    private String phone;
}
