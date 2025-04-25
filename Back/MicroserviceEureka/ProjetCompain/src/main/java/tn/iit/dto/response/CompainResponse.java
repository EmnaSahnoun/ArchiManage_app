package tn.iit.dto.response;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.Date;

@Data
public class CompainResponse {
    private String id;
    private String name;
    private String address;
    private String email;
    private String phone;
    private Date createdAt;
}
