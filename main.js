// Autor: André Alexandre Aguiar
// bibliotecas: Cheerio (1ReeQ6WO8kKNxoaA_O0XEQ589cIrRvEBA9qcWpNqdOP17i47u6N9M5Xh0)

const CATEGORIA_VALIDA = ['225170', '225125', '2231F9']
const DATABASE = '1rclGQuOh68-d30pT7MFItOWHOUXM5TLw79i5eXLGSy4'
const REGISTROS = '102dpaslGU3nYAfQfJIzG5ZY188rl8CoJNGrrlR3wDn8'
const URLS = {
	'sigtap': 'http://sigtap.datasus.gov.br/tabela-unificada/app/sec/inicio.jsp',
	'security-check': 'http://sigtap.datasus.gov.br/tabela-unificada/app/sec/j_security_check',
	'publicados': 'http://sigtap.datasus.gov.br/tabela-unificada/app/sec/relatorio/procedimentoAtributos/publicados',
}
const FORMULARIOS = {
	'consulta': {
		'formRelatorio:tipoRelatorio': 'Completo',
		'formRelatorio:competenciaDisponivel': '',
		'formRelatorio:grupo': '0',
		'formRelatorio:numeroProcedimento': '',
		'formRelatorio:nomeProcedimento': '',
		'formRelatorio:sexo': '',
		'formRelatorio:tipoComparacaoIdadeMinima': '',
		'formRelatorio:idadeMinima': '-1',
		'formRelatorio:tipoComparacaoIdadeMaxima': '',
		'formRelatorio:idadeMaxima': '-1',
		'formRelatorio:tipoComparacaoQtdeMaxima': '',
		'formRelatorio:qtdeMaxima': '',
		'formRelatorio:tipoComparacaoPermanencia': '',
		'formRelatorio:qtdDiasPermanencia': '',
		'formRelatorio:tipoComparacaoPermanencia': '',
		'formRelatorio:qtdTempoPermanencia': '',
		'formRelatorio:tipoComparacaoQtdePontos': '',
		'formRelatorio:qtdePontos': '',
		'formRelatorio:financiamento': '0',
		'formRelatorio:complexidade': '',
		'formRelatorio:tipoComparacaoAmbulatorial': '',
		'formRelatorio:valorAmbulatorial': '',
		'formRelatorio:tipoComparacaoHospitalar': '',
		'formRelatorio:valorHospitalar': '',
		'formRelatorio:rede': '0',
		'formRelatorio:ordem': '1',
		'formRelatorio:formaExibicao': 'TXT',
		'formRelatorio:formaLayout': 'V',
		'formRelatorio:showReport.x': '17',
		'formRelatorio:showReport.y': '24',
		'autoScroll': '0,807',
		'formRelatorio_SUBMIT': '1',
		'formRelatorio:_idcl': '',
		'formRelatorio:_link_hidden_': '',
		'javax.faces.ViewState': '',
	},
	'passos': {
		'autoScroll': '0,0',
		'formMenu_SUBMIT': '1',
		'formMenu:_idcl': '',
		'formMenu:_link_hidden_': '',
		'javax.faces.ViewState': '',
	},
}

// ==================== Início preparação ====================

// TODO: Melhorar gerenciamento de cookie
class Cookie{
	constructor(cookie){
		if(! cookie) return
		this._cookie_dict = {}
		this._cookie_split = cookie.split(';')
		for(let _cookie in this._cookie_split){
			let [chave, valor] = this._cookie_split[_cookie].split('=')
			this._cookie_dict[chave.toUpperCase().replace(/\s+|\t+/, '')] = valor
		}
		this._cookie = String(cookie.match(/^(.+?)=/)[1])
		this._value = this._cookie_dict[this._cookie]
		this._path = this._cookie_dict['PATH'] || ''
		this._expires = this._cookie_dict['EXPIRES'] || ''
		if(this._expires){
			this._date_expires = new Date(this._expires)
		}
		this._domain = this._cookie_dict['DOMAIN'] || ''
		this._samesite = this._cookie_dict['SAMESITE'] || ''
		this._secure = /Secure/i.test(cookie)
		this._http_only = /HttpOnly/i.test(cookie)
	}
	get cookie(){
		return this._cookie
	}
	get value(){
		return this._value
	}
	set value(valor){
		this._value = valor
	}
	get split(){
		return this._cookie_split
	}
	set split(valor){
		this._cookie_split = valor
	}
	get dict(){
		return this._cookie_dict
	}
	set dict(valor){
		this._cookie_dict = valor
	}
	get path(){
		return this._path
	}
	get date(){
		return this._date_expires
	}
	get domain(){
		return this._domain
	}
	get samesite(){
		return this._samesite
	}
	get expires(){
		return this._expires
	}
	get http_only(){
		return this._http_only
	}
	get secure(){
		return this._secure
	}
}

class CookiesJar{
	constructor(){
		this.cookies = []
	}
	registrar(cookie){
		if(! this.cookies.length){
			this.cookies.push(cookie)
			return
		}
		for(let c in this.cookies){
			if(cookie.cookie === this.cookies[c].cookie){
				if(cookie.value !== this.cookies[c].value){
					this.cookies[c].value = cookie.value
					this.cookies[c].dict = cookie.dict
					this.cookies[c].split = cookie.split
					break
				}
			} else {
				continue
			}
			this.cookies.push(cookie)
		}
	}
	cookies(){
		return this.cookies
	}
	str(){
		let cookies = ''
		for(let cookie in this.cookies){
			cookies += `${this.cookies[cookie].cookie}=${this.cookies[cookie].value};`
		}
		return cookies.slice(0, -1)
	}
}

class HTTPRequest{
	constructor(){
		this._r = UrlFetchApp.fetch
		this._resposta = null; // Google's HTTPResponse
		this._headers = null; // dict respostas header
		this._cookies = new CookiesJar()
	}
	get jsessionid(){
		let token = ''
		try {
			token = 'JSESSIONID'
				+ this._resposta.getContentText().match(/jsessionid=(.+?)\b/i)[1]
		} catch(error) {
			return ''
		}
		this._cookies.registrar(new Cookie(token))
		return token
	}
	cookies_str(){
		return this._cookies.str()
	}
	_request(metodo, url, opcoes){
		// url = str, opcoes = dict
		let cookies = this.cookies_str()
		let _opcoes = {
			'method': metodo,
			'headers': {
				'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
					+ '(KHTML, like Gecko) Chrome/102.0.5005.115 Safari/537.36',
				'Cookie': cookies,
			},
			'muteHttpExceptions': true,
		}
		if(! opcoes){
			opcoes = _opcoes
		}
		if(opcoes['method'] !== metodo || ! 'method' in opcoes){
			opcoes['method'] = metodo
		}
		if (! opcoes['headers']){
			opcoes['headers'] = _opcoes['headers']
		}
		if (! opcoes['muteHttpExceptions']){
			opcoes['muteHttpExceptions'] = _opcoes['muteHttpExceptions']
		}
		this._resposta = this._r(url, opcoes)
		this._headers = this._resposta.getAllHeaders()
		if(this._headers['Set-Cookie'] instanceof Array){
			for(let cookie in this._headers['Set-Cookie']){
				this._cookies.registrar(new Cookie(this._headers['Set-Cookie'][cookie]))
			}
		} else {
			this._cookies.registrar(new Cookie(this._headers['Set-Cookie']))
		}
	}
	get(url, opcoes){
		this._request('get', url, opcoes)
	}
	post(url, opcoes){
		this._request('post', url, opcoes)
	}
	get resposta(){
		return this._resposta.getContentText().replace(/\t+/, '').replace(/\r+/, '')
	}
	get byte(){
		return this._resposta.getContent()
	}
	get cookies(){
		return this._cookies.cookies
	}
	get headers(){
		return this._headers
	}
}

// ==================== Fim preparação ====================

class FiltroProcedimento{
	constructor(){
	}
}

class Procedimento{
	constructor(){
		this.informacoes = {}
		// this._chave = ''; // tracking 
	}
	// registrar_dados(dados){
	// }
	// registrar_principal(informacao){
	// 	console.log(informacao)
	// 	if(! informacao || /^\s+$/.test(informacao)){
	// 		return
	// 	}
	// 	if(/:/.test(informacao)){
	// 		let chave = informacao.replace(/:/g, '').replace(/\s+/g, '')
	// 		this.informacoes[chave] = ''
	// 		this._chave = chave
	// 	} else {
	// 		this.informacoes[this._chave] = informacao
	// 	}
	// }
	// registrar_cbo(informcao){
	// }
	// registrar_cids(informacao){
	// }
	// registrar_leito(informacao){
	// }
	// registrar_servico(informacao){
	// }
	// registrar_descricao(informacao){
	// }
	// registrar_habilitacao(informacao){
	// }
	// registrar_redes(informacao){
	// }
	// registrar_origem(informacao){
	// }
	// registrar_regra_condicionada(informacao){
	// }
	// registrar_renases(informacao){
	// }
	// registrar_tuss(informacao){
	// }
}

// TODO: Criar erros customizados!
class Consulta{
	constructor(){
		this._request = new HTTPRequest()
		this._javax_faces_viewstate = ''
		this._codigo_disponivel = ''
	}
	get javax_faces_viewstate(){
		this._javax_faces_viewstate = this.resposta.match(/value=\"(\/N\/.*)?\"/)[1]
		return this._javax_faces_viewstate
	}
	get consulta_disponivel(){
		let hoje = Utilities.formatDate(new Date(), 'GMT-3', 'MM/yyyy')
		let regex = new RegExp(`<option value="(\\d+?)">${hoje}</option>`)
		this._codigo_disponivel = this.resposta.match(regex)[1]
		return this._codigo_disponivel
	}
	get resposta(){
		return this._request.resposta
	}
	login(){
		this._request.get(URLS['sigtap']) // obter url para dados do procedimento
		this._request.post(
			URLS['security-check'],
			{
				'payload': {
					'j_username': 'publico',
					'j_password': 'publico',
				},
			}
		)
	}
	pesquisar(id){
		this._request.get(
			URLS['publicados']
		)
		let formulario = FORMULARIOS['consulta']
		formulario['formRelatorio:numeroProcedimento'] = id
		formulario['javax.faces.ViewState'] = this.javax_faces_viewstate
		formulario['formRelatorio:competenciaDisponivel'] = this.consulta_disponivel
		console.log(formulario)
		this._request.post(
			URLS['publicados'],
			{
				'payload': formulario,
			}
		)
	}
}


function main(){
	let consulta = new Consulta()
	consulta.login()
	consulta.pesquisar('0413010015')
	console.log(consulta.resposta)
}

function doGet(){
	return HtmlService.createHtmlOutputFromFile('main')
}

