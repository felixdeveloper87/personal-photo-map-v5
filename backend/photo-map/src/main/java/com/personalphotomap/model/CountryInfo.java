package com.personalphotomap.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Entity representing cached country information.
 * Stores basic info, economic data, social data, and infrastructure data
 * with different expiration times for each data type.
 */
@Entity
@Table(name = "country_info_cache")
public class CountryInfo {
    
    @Id
    @Column(length = 2)
    private String countryId; // ISO2 code (ex: "US", "BR")
    
    // ========== INFORMAÇÕES BÁSICAS ==========
    private String capital;
    private String officialLanguage;
    private String currency;
    private String currencyName;
    private Long population;
    private String nativeName;
    
    // ========== COORDENADAS ==========
    private Double latitude;
    private Double longitude;
    
    // ========== DADOS ECONÔMICOS ==========
    // GDP (Total)
    private Double gdp; // Valor bruto em USD
    private String gdpFormatted; // Valor formatado (ex: "$29.18 Trillion")
    private String gdpYear;
    private Integer gdpRank;
    private Integer gdpTotalCountries;
    
    // GDP Growth
    private Double gdpGrowth; // Percentual
    private String gdpGrowthYear;
    private Integer gdpGrowthRank;
    private Integer gdpGrowthTotalCountries;
    
    // GDP Per Capita
    private Double gdpPerCapitaCurrent; // Valor bruto em USD
    private String gdpPerCapitaCurrentFormatted;
    private String gdpPerCapitaCurrentYear;
    private Integer gdpPerCapitaCurrentRank;
    private Integer gdpPerCapitaCurrentTotalCountries;
    
    // Public Debt (% GDP)
    private Double debtToGDP; // Percentual
    private String debtToGDPYear;
    private Integer debtToGDPRank;
    private Integer debtToGDPTotalCountries;
    
    // Inflation (CPI)
    private Double inflationCPI; // Percentual
    private String inflationCPIYear;
    private Integer inflationCPIRank;
    private Integer inflationCPITotalCountries;
    
    // GNI Per Capita
    private Double gniPerCapita; // Valor bruto em USD
    private String gniPerCapitaFormatted;
    private String gniPerCapitaYear;
    
    // GNI Per Capita PPP
    private Double gniPerCapitaPPP; // Valor bruto em USD
    private String gniPerCapitaPPPFormatted;
    private String gniPerCapitaPPPYear;
    
    // ========== DADOS SOCIAIS ==========
    // Life Expectancy
    private Double lifeExpectancy; // Em anos
    private String lifeExpectancyYear;
    private Integer lifeExpectancyRank;
    private Integer lifeExpectancyTotalCountries;
    
    // Internet Users (%)
    private Double internetUsers; // Percentual
    private String internetUsersYear;
    private Integer internetUsersRank;
    private Integer internetUsersTotalCountries;
    
    // Urban Population (%)
    private Double urbanPopulation; // Percentual
    private String urbanPopulationYear;
    private Integer urbanPopulationRank;
    private Integer urbanPopulationTotalCountries;
    
    // Literacy Rate (Education)
    private Double education; // Percentual (taxa de alfabetização)
    private String educationYear;
    private Integer educationRank;
    private Integer educationTotalCountries;
    
    // Net Migration
    private Long netMigration; // Número absoluto
    private String netMigrationFormatted;
    private String netMigrationYear;
    private Integer netMigrationRank;
    private Integer netMigrationTotalCountries;
    
    // Unemployment
    private Double unemployment; // Percentual
    private String unemploymentYear;
    
    // Fertility Rate
    private Double fertilityRate; // Taxa de fertilidade
    private String fertilityRateYear;
    private Integer fertilityRateRank;
    private Integer fertilityRateTotalCountries;
    
    // ========== INFRAESTRUTURA ==========
    // Electricity Access (%)
    private Double accessToEletricity; // Percentual
    private String accessToEletricityYear;
    private Integer accessToEletricityRank;
    private Integer accessToEletricityTotalCountries;
    
    // Health Expenditure (% GDP)
    private Double healthExpenses; // Percentual
    private String healthExpensesYear;
    private Integer healthExpensesRank;
    private Integer healthExpensesTotalCountries;
    
    // ========== DADOS ADICIONAIS (JSON para flexibilidade) ==========
    @Column(columnDefinition = "TEXT")
    private String economicDataJson; // JSON com todos os dados econômicos
    
    @Column(columnDefinition = "TEXT")
    private String socialDataJson; // JSON com todos os dados sociais
    
    @Column(columnDefinition = "TEXT")
    private String rankingsJson; // JSON com todos os rankings
    
    // ========== TIMESTAMPS ==========
    @JsonIgnore
    @Column(nullable = false)
    private LocalDateTime lastUpdated;

    @JsonIgnore
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    
    // Tempos de expiração diferentes por tipo de dado
    @JsonIgnore
    @Column(nullable = false)
    private LocalDateTime basicInfoExpiresAt; // Capital, idioma, coordenadas (30 dias)
    
    @JsonIgnore
    @Column(nullable = false)
    private LocalDateTime economicDataExpiresAt; // Dados econômicos (7 dias)
    
    @JsonIgnore
    @Column(nullable = false)
    private LocalDateTime socialDataExpiresAt; // Dados sociais (7 dias)
    
    // ─────────────────────────────────────────────────────────────
    // Constructors
    // ─────────────────────────────────────────────────────────────
    
    public CountryInfo() {
    }
    
    // ─────────────────────────────────────────────────────────────
    // Getters and Setters
    // ─────────────────────────────────────────────────────────────
    
    public String getCountryId() {
        return countryId;
    }
    
    public void setCountryId(String countryId) {
        this.countryId = countryId;
    }
    
    public String getCapital() {
        return capital;
    }
    
    public void setCapital(String capital) {
        this.capital = capital;
    }
    
    public String getOfficialLanguage() {
        return officialLanguage;
    }
    
    public void setOfficialLanguage(String officialLanguage) {
        this.officialLanguage = officialLanguage;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public String getCurrencyName() {
        return currencyName;
    }
    
    public void setCurrencyName(String currencyName) {
        this.currencyName = currencyName;
    }
    
    public Long getPopulation() {
        return population;
    }
    
    public void setPopulation(Long population) {
        this.population = population;
    }
    
    public String getNativeName() {
        return nativeName;
    }
    
    public void setNativeName(String nativeName) {
        this.nativeName = nativeName;
    }
    
    public Double getLatitude() {
        return latitude;
    }
    
    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }
    
    public Double getLongitude() {
        return longitude;
    }
    
    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
    
    // Economic Data Getters and Setters
    public Double getGdp() {
        return gdp;
    }
    
    public void setGdp(Double gdp) {
        this.gdp = gdp;
    }
    
    public String getGdpFormatted() {
        return gdpFormatted;
    }
    
    public void setGdpFormatted(String gdpFormatted) {
        this.gdpFormatted = gdpFormatted;
    }
    
    public String getGdpYear() {
        return gdpYear;
    }
    
    public void setGdpYear(String gdpYear) {
        this.gdpYear = gdpYear;
    }
    
    public Integer getGdpRank() {
        return gdpRank;
    }
    
    public void setGdpRank(Integer gdpRank) {
        this.gdpRank = gdpRank;
    }
    
    public Integer getGdpTotalCountries() {
        return gdpTotalCountries;
    }
    
    public void setGdpTotalCountries(Integer gdpTotalCountries) {
        this.gdpTotalCountries = gdpTotalCountries;
    }
    
    public Double getGdpGrowth() {
        return gdpGrowth;
    }
    
    public void setGdpGrowth(Double gdpGrowth) {
        this.gdpGrowth = gdpGrowth;
    }
    
    public String getGdpGrowthYear() {
        return gdpGrowthYear;
    }
    
    public void setGdpGrowthYear(String gdpGrowthYear) {
        this.gdpGrowthYear = gdpGrowthYear;
    }
    
    public Integer getGdpGrowthRank() {
        return gdpGrowthRank;
    }
    
    public void setGdpGrowthRank(Integer gdpGrowthRank) {
        this.gdpGrowthRank = gdpGrowthRank;
    }
    
    public Integer getGdpGrowthTotalCountries() {
        return gdpGrowthTotalCountries;
    }
    
    public void setGdpGrowthTotalCountries(Integer gdpGrowthTotalCountries) {
        this.gdpGrowthTotalCountries = gdpGrowthTotalCountries;
    }
    
    public Double getGdpPerCapitaCurrent() {
        return gdpPerCapitaCurrent;
    }
    
    public void setGdpPerCapitaCurrent(Double gdpPerCapitaCurrent) {
        this.gdpPerCapitaCurrent = gdpPerCapitaCurrent;
    }
    
    public String getGdpPerCapitaCurrentFormatted() {
        return gdpPerCapitaCurrentFormatted;
    }
    
    public void setGdpPerCapitaCurrentFormatted(String gdpPerCapitaCurrentFormatted) {
        this.gdpPerCapitaCurrentFormatted = gdpPerCapitaCurrentFormatted;
    }
    
    public String getGdpPerCapitaCurrentYear() {
        return gdpPerCapitaCurrentYear;
    }
    
    public void setGdpPerCapitaCurrentYear(String gdpPerCapitaCurrentYear) {
        this.gdpPerCapitaCurrentYear = gdpPerCapitaCurrentYear;
    }
    
    public Integer getGdpPerCapitaCurrentRank() {
        return gdpPerCapitaCurrentRank;
    }
    
    public void setGdpPerCapitaCurrentRank(Integer gdpPerCapitaCurrentRank) {
        this.gdpPerCapitaCurrentRank = gdpPerCapitaCurrentRank;
    }
    
    public Integer getGdpPerCapitaCurrentTotalCountries() {
        return gdpPerCapitaCurrentTotalCountries;
    }
    
    public void setGdpPerCapitaCurrentTotalCountries(Integer gdpPerCapitaCurrentTotalCountries) {
        this.gdpPerCapitaCurrentTotalCountries = gdpPerCapitaCurrentTotalCountries;
    }
    
    public Double getDebtToGDP() {
        return debtToGDP;
    }
    
    public void setDebtToGDP(Double debtToGDP) {
        this.debtToGDP = debtToGDP;
    }
    
    public String getDebtToGDPYear() {
        return debtToGDPYear;
    }
    
    public void setDebtToGDPYear(String debtToGDPYear) {
        this.debtToGDPYear = debtToGDPYear;
    }
    
    public Integer getDebtToGDPRank() {
        return debtToGDPRank;
    }
    
    public void setDebtToGDPRank(Integer debtToGDPRank) {
        this.debtToGDPRank = debtToGDPRank;
    }
    
    public Integer getDebtToGDPTotalCountries() {
        return debtToGDPTotalCountries;
    }
    
    public void setDebtToGDPTotalCountries(Integer debtToGDPTotalCountries) {
        this.debtToGDPTotalCountries = debtToGDPTotalCountries;
    }
    
    public Double getInflationCPI() {
        return inflationCPI;
    }
    
    public void setInflationCPI(Double inflationCPI) {
        this.inflationCPI = inflationCPI;
    }
    
    public String getInflationCPIYear() {
        return inflationCPIYear;
    }
    
    public void setInflationCPIYear(String inflationCPIYear) {
        this.inflationCPIYear = inflationCPIYear;
    }
    
    public Integer getInflationCPIRank() {
        return inflationCPIRank;
    }
    
    public void setInflationCPIRank(Integer inflationCPIRank) {
        this.inflationCPIRank = inflationCPIRank;
    }
    
    public Integer getInflationCPITotalCountries() {
        return inflationCPITotalCountries;
    }
    
    public void setInflationCPITotalCountries(Integer inflationCPITotalCountries) {
        this.inflationCPITotalCountries = inflationCPITotalCountries;
    }
    
    public Double getGniPerCapita() {
        return gniPerCapita;
    }
    
    public void setGniPerCapita(Double gniPerCapita) {
        this.gniPerCapita = gniPerCapita;
    }
    
    public String getGniPerCapitaFormatted() {
        return gniPerCapitaFormatted;
    }
    
    public void setGniPerCapitaFormatted(String gniPerCapitaFormatted) {
        this.gniPerCapitaFormatted = gniPerCapitaFormatted;
    }
    
    public String getGniPerCapitaYear() {
        return gniPerCapitaYear;
    }
    
    public void setGniPerCapitaYear(String gniPerCapitaYear) {
        this.gniPerCapitaYear = gniPerCapitaYear;
    }
    
    public Double getGniPerCapitaPPP() {
        return gniPerCapitaPPP;
    }
    
    public void setGniPerCapitaPPP(Double gniPerCapitaPPP) {
        this.gniPerCapitaPPP = gniPerCapitaPPP;
    }
    
    public String getGniPerCapitaPPPFormatted() {
        return gniPerCapitaPPPFormatted;
    }
    
    public void setGniPerCapitaPPPFormatted(String gniPerCapitaPPPFormatted) {
        this.gniPerCapitaPPPFormatted = gniPerCapitaPPPFormatted;
    }
    
    public String getGniPerCapitaPPPYear() {
        return gniPerCapitaPPPYear;
    }
    
    public void setGniPerCapitaPPPYear(String gniPerCapitaPPPYear) {
        this.gniPerCapitaPPPYear = gniPerCapitaPPPYear;
    }
    
    // Social Data Getters and Setters
    public Double getLifeExpectancy() {
        return lifeExpectancy;
    }
    
    public void setLifeExpectancy(Double lifeExpectancy) {
        this.lifeExpectancy = lifeExpectancy;
    }
    
    public String getLifeExpectancyYear() {
        return lifeExpectancyYear;
    }
    
    public void setLifeExpectancyYear(String lifeExpectancyYear) {
        this.lifeExpectancyYear = lifeExpectancyYear;
    }
    
    public Integer getLifeExpectancyRank() {
        return lifeExpectancyRank;
    }
    
    public void setLifeExpectancyRank(Integer lifeExpectancyRank) {
        this.lifeExpectancyRank = lifeExpectancyRank;
    }
    
    public Integer getLifeExpectancyTotalCountries() {
        return lifeExpectancyTotalCountries;
    }
    
    public void setLifeExpectancyTotalCountries(Integer lifeExpectancyTotalCountries) {
        this.lifeExpectancyTotalCountries = lifeExpectancyTotalCountries;
    }
    
    public Double getInternetUsers() {
        return internetUsers;
    }
    
    public void setInternetUsers(Double internetUsers) {
        this.internetUsers = internetUsers;
    }
    
    public String getInternetUsersYear() {
        return internetUsersYear;
    }
    
    public void setInternetUsersYear(String internetUsersYear) {
        this.internetUsersYear = internetUsersYear;
    }
    
    public Integer getInternetUsersRank() {
        return internetUsersRank;
    }
    
    public void setInternetUsersRank(Integer internetUsersRank) {
        this.internetUsersRank = internetUsersRank;
    }
    
    public Integer getInternetUsersTotalCountries() {
        return internetUsersTotalCountries;
    }
    
    public void setInternetUsersTotalCountries(Integer internetUsersTotalCountries) {
        this.internetUsersTotalCountries = internetUsersTotalCountries;
    }
    
    public Double getUrbanPopulation() {
        return urbanPopulation;
    }
    
    public void setUrbanPopulation(Double urbanPopulation) {
        this.urbanPopulation = urbanPopulation;
    }
    
    public String getUrbanPopulationYear() {
        return urbanPopulationYear;
    }
    
    public void setUrbanPopulationYear(String urbanPopulationYear) {
        this.urbanPopulationYear = urbanPopulationYear;
    }
    
    public Integer getUrbanPopulationRank() {
        return urbanPopulationRank;
    }
    
    public void setUrbanPopulationRank(Integer urbanPopulationRank) {
        this.urbanPopulationRank = urbanPopulationRank;
    }
    
    public Integer getUrbanPopulationTotalCountries() {
        return urbanPopulationTotalCountries;
    }
    
    public void setUrbanPopulationTotalCountries(Integer urbanPopulationTotalCountries) {
        this.urbanPopulationTotalCountries = urbanPopulationTotalCountries;
    }
    
    public Double getEducation() {
        return education;
    }
    
    public void setEducation(Double education) {
        this.education = education;
    }
    
    public String getEducationYear() {
        return educationYear;
    }
    
    public void setEducationYear(String educationYear) {
        this.educationYear = educationYear;
    }
    
    public Integer getEducationRank() {
        return educationRank;
    }
    
    public void setEducationRank(Integer educationRank) {
        this.educationRank = educationRank;
    }
    
    public Integer getEducationTotalCountries() {
        return educationTotalCountries;
    }
    
    public void setEducationTotalCountries(Integer educationTotalCountries) {
        this.educationTotalCountries = educationTotalCountries;
    }
    
    public Long getNetMigration() {
        return netMigration;
    }
    
    public void setNetMigration(Long netMigration) {
        this.netMigration = netMigration;
    }
    
    public String getNetMigrationFormatted() {
        return netMigrationFormatted;
    }
    
    public void setNetMigrationFormatted(String netMigrationFormatted) {
        this.netMigrationFormatted = netMigrationFormatted;
    }
    
    public String getNetMigrationYear() {
        return netMigrationYear;
    }
    
    public void setNetMigrationYear(String netMigrationYear) {
        this.netMigrationYear = netMigrationYear;
    }
    
    public Integer getNetMigrationRank() {
        return netMigrationRank;
    }
    
    public void setNetMigrationRank(Integer netMigrationRank) {
        this.netMigrationRank = netMigrationRank;
    }
    
    public Integer getNetMigrationTotalCountries() {
        return netMigrationTotalCountries;
    }
    
    public void setNetMigrationTotalCountries(Integer netMigrationTotalCountries) {
        this.netMigrationTotalCountries = netMigrationTotalCountries;
    }
    
    public Double getUnemployment() {
        return unemployment;
    }
    
    public void setUnemployment(Double unemployment) {
        this.unemployment = unemployment;
    }
    
    public String getUnemploymentYear() {
        return unemploymentYear;
    }
    
    public void setUnemploymentYear(String unemploymentYear) {
        this.unemploymentYear = unemploymentYear;
    }
    
    public Double getFertilityRate() {
        return fertilityRate;
    }
    
    public void setFertilityRate(Double fertilityRate) {
        this.fertilityRate = fertilityRate;
    }
    
    public String getFertilityRateYear() {
        return fertilityRateYear;
    }
    
    public void setFertilityRateYear(String fertilityRateYear) {
        this.fertilityRateYear = fertilityRateYear;
    }
    
    public Integer getFertilityRateRank() {
        return fertilityRateRank;
    }
    
    public void setFertilityRateRank(Integer fertilityRateRank) {
        this.fertilityRateRank = fertilityRateRank;
    }
    
    public Integer getFertilityRateTotalCountries() {
        return fertilityRateTotalCountries;
    }
    
    public void setFertilityRateTotalCountries(Integer fertilityRateTotalCountries) {
        this.fertilityRateTotalCountries = fertilityRateTotalCountries;
    }
    
    // Infrastructure Getters and Setters
    public Double getAccessToEletricity() {
        return accessToEletricity;
    }
    
    public void setAccessToEletricity(Double accessToEletricity) {
        this.accessToEletricity = accessToEletricity;
    }
    
    public String getAccessToEletricityYear() {
        return accessToEletricityYear;
    }
    
    public void setAccessToEletricityYear(String accessToEletricityYear) {
        this.accessToEletricityYear = accessToEletricityYear;
    }
    
    public Integer getAccessToEletricityRank() {
        return accessToEletricityRank;
    }
    
    public void setAccessToEletricityRank(Integer accessToEletricityRank) {
        this.accessToEletricityRank = accessToEletricityRank;
    }
    
    public Integer getAccessToEletricityTotalCountries() {
        return accessToEletricityTotalCountries;
    }
    
    public void setAccessToEletricityTotalCountries(Integer accessToEletricityTotalCountries) {
        this.accessToEletricityTotalCountries = accessToEletricityTotalCountries;
    }
    
    public Double getHealthExpenses() {
        return healthExpenses;
    }
    
    public void setHealthExpenses(Double healthExpenses) {
        this.healthExpenses = healthExpenses;
    }
    
    public String getHealthExpensesYear() {
        return healthExpensesYear;
    }
    
    public void setHealthExpensesYear(String healthExpensesYear) {
        this.healthExpensesYear = healthExpensesYear;
    }
    
    public Integer getHealthExpensesRank() {
        return healthExpensesRank;
    }
    
    public void setHealthExpensesRank(Integer healthExpensesRank) {
        this.healthExpensesRank = healthExpensesRank;
    }
    
    public Integer getHealthExpensesTotalCountries() {
        return healthExpensesTotalCountries;
    }
    
    public void setHealthExpensesTotalCountries(Integer healthExpensesTotalCountries) {
        this.healthExpensesTotalCountries = healthExpensesTotalCountries;
    }
    
    // JSON Data Getters and Setters
    public String getEconomicDataJson() {
        return economicDataJson;
    }
    
    public void setEconomicDataJson(String economicDataJson) {
        this.economicDataJson = economicDataJson;
    }
    
    public String getSocialDataJson() {
        return socialDataJson;
    }
    
    public void setSocialDataJson(String socialDataJson) {
        this.socialDataJson = socialDataJson;
    }
    
    public String getRankingsJson() {
        return rankingsJson;
    }
    
    public void setRankingsJson(String rankingsJson) {
        this.rankingsJson = rankingsJson;
    }
    
    // Timestamps Getters and Setters
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public LocalDateTime getBasicInfoExpiresAt() {
        return basicInfoExpiresAt;
    }
    
    public void setBasicInfoExpiresAt(LocalDateTime basicInfoExpiresAt) {
        this.basicInfoExpiresAt = basicInfoExpiresAt;
    }
    
    public LocalDateTime getEconomicDataExpiresAt() {
        return economicDataExpiresAt;
    }
    
    public void setEconomicDataExpiresAt(LocalDateTime economicDataExpiresAt) {
        this.economicDataExpiresAt = economicDataExpiresAt;
    }
    
    public LocalDateTime getSocialDataExpiresAt() {
        return socialDataExpiresAt;
    }
    
    public void setSocialDataExpiresAt(LocalDateTime socialDataExpiresAt) {
        this.socialDataExpiresAt = socialDataExpiresAt;
    }
    
    /**
     * Automatically sets the lastUpdated timestamp before persisting.
     */
    @PrePersist
    protected void onCreate() {
        if (this.lastUpdated == null) {
            this.lastUpdated = LocalDateTime.now();
        }
    }
}