export const fetchWorldBankIndicators = async (isoCode) => {
    if (!isoCode || isoCode === 'undefined') {
        console.error('fetchWorldBankIndicators: isoCode is undefined or invalid');
        return {};
    }
    
    const indicators = {
        gdp: "NY.GDP.MKTP.CD",
        lifeExpectancy: "SP.DYN.LE00.IN",
        gniPerCapita: "NY.GNP.PCAP.CD",
        gdpGrowth: "NY.GDP.MKTP.KD.ZG",
        internetUsers: "IT.NET.USER.ZS",
        urbanPopulation: "SP.URB.TOTL.IN.ZS",
        unemployment: "SL.UEM.TOTL.ZS",
        gniPerCapitaPPP: "NY.GNP.PCAP.PP.CD",
        fertilityRate: "SP.DYN.TFRT.IN",
        accessToEletricity: "EG.ELC.ACCS.ZS",
        education: "SE.ADT.LITR.ZS",
        healthExpenses: "SH.XPD.CHEX.GD.ZS",
        netMigration: "SM.POP.NETM",
        gdpPerCapitaCurrent: "NY.GDP.PCAP.CD",
        inflationCPI: "FP.CPI.TOTL.ZG",
        debtToGDP: "GC.DOD.TOTL.GD.ZS",
    };

    const fetchIndicator = async (code) => {
        const url = `https://api.worldbank.org/v2/country/${isoCode}/indicator/${code}?format=json&per_page=100`;
        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        const validEntry = data[1]
            ?.filter(entry => entry.value !== null)
            ?.sort((a, b) => parseInt(b.date) - parseInt(a.date))[0];

        return validEntry || null;
    };

    const results = await Promise.all(
        Object.entries(indicators).map(async ([key, code]) => {
            const entry = await fetchIndicator(code);
            return [key, entry];
        })
    );

    const formatters = {
        currencyUSD: (val) => formatGDP(val),
        percent: (val) => val != null ? `${val.toFixed(1)}%` : 'N/A',
        years: (val) => val != null ? `${val.toFixed(1)} years` : 'N/A',
    };

    const formatted = {};

    for (const [key, entry] of results) {
        if (!entry) continue;

        const val = entry.value;
        const year = entry.date;

        switch (key) {
            case 'gdp':
                formatted.gdp = {
                    value: formatters.currencyUSD(val, true),
                    raw: val,
                    year,
                };
                break;
            case 'lifeExpectancy':
                formatted.lifeExpectancy = { value: formatters.years(val), year };
                break;
            case 'gniPerCapita':
                formatted.gniPerCapita = { value: formatters.currencyUSD(val), year };
                break;
            case 'gniPerCapitaPPP':
                formatted.hdiProxy = { value: formatters.currencyUSD(val), year };
                break;
            case 'gdpGrowth':
            case 'internetUsers':
            case 'urbanPopulation':
            case 'unemployment':
                formatted[key] = { value: formatters.percent(val), year };
                break;
            case 'fertilityRate':
            case 'accessToEletricity':
            case 'education':
            case 'healthExpenses':
                formatted[key] = { value: formatters.percent(val), year };
                break;
            case 'netMigration':
                formatted.netMigration = {
                    value: val.toLocaleString('en-US'),
                    year,
                };
                break;

            case 'gdpPerCapitaCurrent':
                formatted.gdpPerCapitaCurrent = {
                    value: formatters.currencyUSD(val),
                    year,
                };
                break;

            case 'inflationCPI':
                formatted.inflationCPI = {
                    value: formatters.percent(val),
                    year,
                };
                break;

            case 'debtToGDP':
                formatted.debtToGDP = {
                    value: formatters.percent(val),
                    year,
                };
                break;


            default:
                break;
        }
    }
    return formatted;
};


const formatGDP = (value) => {
    if (value >= 1_000_000_000_000) {
        return `$${(value / 1_000_000_000_000).toFixed(2)} Trillion`;
    }
    if (value >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(2)} Billion`;
    }
    if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)} Million`;
    }
    return `$${value.toLocaleString('en-US')}`;
};

