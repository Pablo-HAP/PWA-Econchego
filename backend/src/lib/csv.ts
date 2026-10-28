type CsvValue = string | number | null;

// Excel em português usa ponto e vírgula como separador e vírgula decimal.
const SEPARATOR = ";";

const csvCell = (value: CsvValue): string => {
	if (value === null) {
		return "";
	}
	if (typeof value === "number") {
		return String(value).replace(".", ",");
	}

	// Texto começando com = + - @ pode virar fórmula ao abrir no Excel: vira texto literal.
	const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;

	return /[";\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

// O BOM (\uFEFF) faz o Excel reconhecer os acentos (UTF-8).
const toCsv = (header: string[], rows: CsvValue[][]) => {
	const lines = [header, ...rows].map((row) => row.map(csvCell).join(SEPARATOR));

	return `\uFEFF${lines.join("\r\n")}\r\n`;
};

export { toCsv };
export type { CsvValue };
