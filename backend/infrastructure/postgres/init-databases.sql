-- DEPRECATED: use infrastructure/database/init/01-create-databases.sql
-- Create per-service databases for NEOALERT microservices
CREATE DATABASE api_gateway;
CREATE DATABASE identity_service;
CREATE DATABASE tenant_service;
CREATE DATABASE employee_service;
CREATE DATABASE attendance_service;
CREATE DATABASE location_service;
CREATE DATABASE incident_service;
CREATE DATABASE file_ingestion_service;
CREATE DATABASE template_configuration_service;
CREATE DATABASE notification_service;
CREATE DATABASE reporting_service;
CREATE DATABASE ai_service;
CREATE DATABASE audit_service;
