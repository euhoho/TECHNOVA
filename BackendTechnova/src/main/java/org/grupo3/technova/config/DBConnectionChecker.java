package org.grupo3.technova.config;

import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import javax.sql.DataSource;
import java.sql.Connection;
@Component
public class DBConnectionChecker {
    private final DataSource dataSource;

    public DBConnectionChecker(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostConstruct
    public void checkConnection() {

    }
}
