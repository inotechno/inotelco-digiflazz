export const getProviderByPrefix = (prefix: string): string => {
  const map: Record<string, string> = {
    "0811": "TELKOMSEL",
    "0812": "TELKOMSEL",
    "0813": "TELKOMSEL",
    "0821": "TELKOMSEL",
    "0822": "TELKOMSEL",
    "0852": "TELKOMSEL",
    "0853": "TELKOMSEL",
    "0823": "TELKOMSEL",
    "0851": "TELKOMSEL",
    "0814": "INDOSAT",
    "0815": "INDOSAT",
    "0816": "INDOSAT",
    "0855": "INDOSAT",
    "0856": "INDOSAT",
    "0857": "INDOSAT",
    "0858": "INDOSAT",
    "0817": "XL",
    "0818": "XL",
    "0819": "XL",
    "0859": "XL",
    "0877": "XL",
    "0878": "XL",
    "0831": "AXIS",
    "0832": "AXIS",
    "0833": "AXIS",
    "0838": "AXIS",
    "0895": "TRI",
    "0896": "TRI",
    "0897": "TRI",
    "0898": "TRI",
    "0899": "TRI",
    "0881": "SMARTFREN",
    "0882": "SMARTFREN",
    "0883": "SMARTFREN",
    "0884": "SMARTFREN",
    "0885": "SMARTFREN",
    "0886": "SMARTFREN",
    "0887": "SMARTFREN",
    "0888": "SMARTFREN",
    "0889": "SMARTFREN",
  };

  return map[prefix] || "UNKNOWN";
};

export const getProviderLogo = (provider: string): string => {
    // Assuming logos are in /brands/
    const logos: Record<string, string> = {
        "TELKOMSEL": "/brands/telkomsel.png",
        "INDOSAT": "/brands/indosat.png",
        "XL": "/brands/xl.png",
        "AXIS": "/brands/axis.png",
        "THREE": "/brands/three.png",
        "SMARTFREN": "/brands/smartfren.png",
    };
    return logos[provider] || "";
};
