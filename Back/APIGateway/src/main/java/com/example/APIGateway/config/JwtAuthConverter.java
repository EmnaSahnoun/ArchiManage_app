package com.example.APIGateway.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class JwtAuthConverter{
//public class JwtAuthConverter implements Converter<Jwt, AbstractAuthenticationToken> {
//    private final JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter=new JwtGrantedAuthoritiesConverter();
//    @Override
//    public AbstractAuthenticationToken convert(Jwt jwt) {
//        Collection<GrantedAuthority> authorities = Stream.concat(
//                jwtGrantedAuthoritiesConverter.convert(jwt).stream(),
//                extractResourceRoles(jwt).stream()
//        ).collect(Collectors.toSet());
//        return new JwtAuthenticationToken(jwt, authorities,jwt.getClaim("preferred_username"));
//    }
//    private Collection<GrantedAuthority> extractResourceRoles(Jwt jwt) {
//        Map<String , Object> realmAccess;
//        Collection<String> roles;
//        if(jwt.getClaim("realm_access")==null){
//            return Set.of();
//        }
//        realmAccess = jwt.getClaim("realm_access");
//        roles = (Collection<String>) realmAccess.get("roles");
//        return roles.stream().map(role->new SimpleGrantedAuthority(role)).collect(Collectors.toSet());
//    }
public ReactiveJwtAuthenticationConverterAdapter jwtAuthenticationConverter() {
    JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(jwt -> {
        Collection<GrantedAuthority> authorities = new ArrayList<>();

        // Rôles du realm
        if (jwt.hasClaim("realm_access")) {
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess.containsKey("roles")) {
                ((List<?>) realmAccess.get("roles")).forEach(role -> {
                    if (role instanceof String) {
                        // Supprimez le préfixe "ROLE_" si présent dans Keycloak
                        String roleName = ((String) role).startsWith("ROLE_")
                                ? ((String) role)
                                : "ROLE_" + ((String) role).toUpperCase();
                        authorities.add(new SimpleGrantedAuthority(roleName));
                    }
                });
            }
        }

        // Ajout spécifique pour les comptes de service
        if (jwt.getClaimAsString("preferred_username").startsWith("service-account")) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        return authorities;
    });
    return new ReactiveJwtAuthenticationConverterAdapter(converter);
}
}
