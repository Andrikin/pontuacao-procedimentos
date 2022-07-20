const CATEGORIA_VALIDA = ['225170', '225125', '2231F9'];
const SIGTAP = 'http://sigtap.datasus.gov.br';
const APP = '/tabela-unificada/app/login.jsp';
const PUBLICADOS = '/tabela-unificada/app/sec/relatorio/procedimentoAtributos/publicados';
const SECURITY_CHECK = '/tabela-unificada/app/sec/relatorio/procedimentoAtributos/j_security_check';
const DATABASE = '1rclGQuOh68-d30pT7MFItOWHOUXM5TLw79i5eXLGSy4';
const REGISTROS = '102dpaslGU3nYAfQfJIzG5ZY188rl8CoJNGrrlR3wDn8';

// ==================== Início preparação ====================

class Cookie{
	constructor(cookie){
		this._cookie_raw = cookie;
		this._cookie = cookie.match(/^(\w+)=.*/)[1];
		this._value = cookie.match(/^.*=(\w+);/)[1];
		this._path = cookie.match(/path=(\w+);/)[1];
		this._expires = cookie.match(/expires=(\w+);/)[1];
		this._date_expires = new Date(this._expires);
		this._domain = cookie.match(/domain=(\w+);/)[1];
		this._samesite = cookie.match(/SameSite=(\w+);/)[1];
		this._secure = cookie.test(/Secure/);
		this._http_only = cookie.test(/HttpOnly/);
	}
	get cookie(){
		return this._cookie;
	}
	get valor(){
		return this._value;
	}
	get path(){
		return this._path;
	}
	get date(){
		return this._date_expires;
	}
	get domain(){
		return this._domain;
	}
	get samesite(){
		return this._samesite;
	}
	get expires(){
		return this._expires;
	}
	get http_only(){
		return this._http_only;
	}
	get secure(){
		return this._secure;
	}
}

class Request{
	constructor(){
		this._r = UrlFetchApp.fetch;
		this._resposta = null; // Google's HTTPResponse
		this._headers = null; // dict respostas header
		this._cookies = {
			cookies: [],
			registrar(cookie){
				for(let c in this.cookies){
					if(cookie.cookie === c.cookie){
						if(cookie.valor !== c.valor){
							this.cookies.push(cookie);
							break;
						}
					} else {
						continue;
					}
					this.cookies.push(cookie);
				}
			},
			cookies(){
				return this._cookies;
			},
		}
	}
	_request(metodo, url, opcoes){
		// url = str, opcoes = dict
		let _opcoes = {
			'method': metodo
		};
		if(! opcoes){
			opcoes = _opcoes
		}
		if(opcoes['method'] !== metodo || ! 'method' in opcoes){
			opcoes['method'] = metodo;
		}
		this._resposta = this._r(url, opcoes);
		this._headers = this._resposta.getAllHeaders();
		for(let cookie in this._headers['Set-Cookie']){
			this._cookies.registrar(new Cookie(this._headers['Set-Cookie'][cookie]));
		}
	}
	get(url, opcoes){
		this._request('get', url, opcoes);
	}
	post(url, opcoes){
		this._request('post', url, opcoes);
	}
	get resposta(){
		return this._resposta;
	}
	get cookies(){
		return this._cookies.cookies;
	}
	get headers(){
		return this._headers;
	}
}

// ==================== Fim preparação ====================

class FiltroProcedimento{
	constructor(){
	}
}

function pesquisar_procedimento(){
	let request = new Request();
	let opcoes = {
		'method': 'post',
		'payload': {
			'j_username': 'publico',
			'j_password': 'publico'
		}
	}
	let request = UrlFetchApp.fetch(SIGTAP + APP, opcoes)
	console.log(request.getContentText())
	let request = UrlFetchApp.fetch(SIGTAP + PUBLICADOS)
	console.log(request.getContentText())
}

function doGet(){
	return HtmlService.createHtmlOutputFromFile('main');
}
