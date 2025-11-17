const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../../utils/logger');

/**
 * Fundamentus Client - Scraping de indicadores fundamentalistas
 */
class FundamentusClient {
  constructor() {
    this.baseUrl = 'https://www.fundamentus.com.br';
    this.timeout = 10000;
  }

  /**
   * Busca indicadores do Fundamentus via scraping
   */
  async getIndicators(ticker) {
    try {
      logger.info(`Buscando dados do Fundamentus para ${ticker}`);

      const url = `${this.baseUrl}/detalhes.php?papel=${ticker}`;
      
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Verificar se a página retornou dados válidos
      const title = $('title').text();
      if (title.includes('não encontrado') || title.includes('erro')) {
        logger.warn(`Fundamentus: Ação ${ticker} não encontrada`);
        return null;
      }

      return {
        // Cotação
        cotacao: this.parseValue($, 'Cotação'),
        
        // Valuation
        pl: this.parseValue($, 'P/L'),
        pvp: this.parseValue($, 'P/VP'),
        psr: this.parseValue($, 'PSR'),
        pcf: this.parseValue($, 'P/Cap.Giro'),
        evebitda: this.parseValue($, 'EV/EBITDA'),
        dy: this.parseValue($, 'Div. Yield') / 100, // Converter para decimal
        
        // Rentabilidade
        roe: this.parseValue($, 'ROE') / 100,
        roa: this.parseValue($, 'ROA') / 100,
        roic: this.parseValue($, 'ROIC') / 100,
        
        // Margens
        margebitda: this.parseValue($, 'Marg. EBITDA') / 100,
        margliq: this.parseValue($, 'Marg. Líquida') / 100,
        margbruta: this.parseValue($, 'Marg. Bruta') / 100,
        
        // Endividamento
        divbpatr: this.parseValue($, 'Dív. Bruta/Pat.'),
        divbruta: this.parseValue($, 'Dív. Bruta'),
        divliq: this.parseValue($, 'Dív. Líquida'),
        liqcorr: this.parseValue($, 'Liq. Corr.'),
        liq2meses: this.parseValue($, 'Liq. 2 meses'),
        
        // Crescimento
        cresrec5a: this.parseValue($, 'Cresc. Rec. 5a') / 100,
        
        // Dados financeiros
        lpa: this.parseValue($, 'LPA'),
        vpa: this.parseValue($, 'VPA'),
        ebitda: this.parseValue($, 'EBITDA'),
        receitaLiquida: this.parseValue($, 'Receita Líquida'),
        lucroLiquido: this.parseValue($, 'Lucro Líquido'),
        
        // Ações
        nroAcoes: this.parseValue($, 'Nro. Ações'),
        
        // Patrimônio
        ativoTotal: this.parseValue($, 'Ativo Total'),
        disponibilidades: this.parseValue($, 'Disponibilidades'),
        ativoCirculante: this.parseValue($, 'Ativo Circulante'),
        
        // Setor
        setor: this.extractText($, 'Setor'),
        subsetor: this.extractText($, 'Subsetor')
      };

    } catch (error) {
      logger.warn(`Fundamentus falhou para ${ticker}:`, error.message);
      return null;
    }
  }

  /**
   * Parse valor numérico da tabela
   */
  parseValue($, label) {
    try {
      // Buscar o label e pegar o próximo td
      const element = $(`td.label:contains("${label}")`).next('td.data');
      
      if (element.length === 0) {
        // Tentar busca alternativa
        const altElement = $(`span:contains("${label}")`).parent().next();
        if (altElement.length > 0) {
          return this.convertToNumber(altElement.text().trim());
        }
        return null;
      }

      const text = element.text().trim();
      return this.convertToNumber(text);

    } catch (error) {
      logger.debug(`Erro ao parsear ${label}:`, error.message);
      return null;
    }
  }

  /**
   * Extrai texto da tabela
   */
  extractText($, label) {
    try {
      const element = $(`td.label:contains("${label}")`).next('td.data');
      return element.text().trim() || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Converte string para número
   */
  convertToNumber(text) {
    if (!text || text === '-' || text === 'N/A') return null;
    
    // Remove % e converte para decimal
    let cleaned = text.replace('%', '');
    
    // Remove pontos de milhar e troca vírgula por ponto
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    
    // Remove caracteres não numéricos (exceto . e -)
    cleaned = cleaned.replace(/[^\d.-]/g, '');
    
    const number = parseFloat(cleaned);
    return isNaN(number) ? null : number;
  }
}

module.exports = FundamentusClient;
