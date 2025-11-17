import cheerio from "cheerio";
import iconv from "iconv-lite";

const res = await fetch("https://fundamentus.com.br/detalhes.php?papel=VALE3", {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8"
  }
});
const buf = Buffer.from(await res.arrayBuffer());
const text = iconv.decode(buf, "ISO-8859-1");
const $ = cheerio.load(text);

function pick(label) {
  return $("td").filter((_, td) => $(td).text().replace(/\s+/g, " ").trim() === label).next().text().trim();
}

console.log({
  dia: pick("Dia"),
  mes: pick("Mês"),
  '30d': pick("30 dias"),
  '12m': pick("12 meses"),
  ano2025: pick("2025"),
});
