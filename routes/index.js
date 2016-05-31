var express 	= require('express');
var router 		= express.Router();
var mongoose 	= require('mongoose');
var Serie 		= mongoose.model('Serie');

/**
Temos duas rotas '/series', uma para receber requisições GET, que retorna todas as séries do banco de dados em formato JSON
 e outra para requisições POST, para salvar uma série no banco de dados.
*/

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/series', function(req, res, next) {
	Serie.find(function(err, series) {
		if(err)
			return next(err);

		res.json(series); //método res.json(param) envia uma resposta no formato JSON do objeto passado como parâmetro.
	});
});

router.post('/series', function(req, res, next) {
	var serie = new Serie(req.body);

	if(serie.trailerURL && serie.trailerURL != '')
		serie.trailerURL = serie.trailerURL.replace('watch?v=', 'embed/');

	serie.save(function(err, serie) { //método save de Model salva o documento no banco de dados
		if(err)
			return next(err);

		res.json(serie);
	});
});

router.get('/series/:serie_id', function(req, res, next) { //GET:  retorna uma série com determinado id (parâmetro :serie_id)
		
	var query = Serie.findById(req.params.serie_id); //método findById de Model procura por um documento único baseado em seu id e retorna uma query.

	query.exec(function(err, serie) { // método exec de Query executa a query e retorna os resultados através do callback passado como parâmetro.
		if(err)
			next(err);
		if(!serie)
			return next(new Error("Não foi possível encontrar a série"));
		
		res.json(serie);	
	});
});

router.delete('/series/:serie_id', function(req, res, next) { //deleta uma série com determinado id (parâmetro :serie_id)
	
	var query = Serie.findById(req.params.serie_id);

	query.remove(function(err, serie) { //método remove de Query remove um documento do banco de dados.
		if(err)
			return next(err);
		res.json({mensagem: 'deletado com sucesso'});
	});
});

router.put('/series/:serie_id', function(req, res, next) {	 //atualiza uma série com determinado id (parâmetro :serie_id)

	var query = Serie.findById(req.params.serie_id);

	query.exec(function(err, serie) {
		if(err)
			return next(err);
		if(!serie)
			return next(new Error("Não foi possível encontrar a série"));
		serie.titulo = req.body.titulo;
		serie.genero = req.body.genero;
		serie.trailerURL = req.body.trailerURL.replace('watch?v=', 'embed/');
		serie.save();
		res.json({mensagem: 'atualizado com sucesso'});
	});
});

module.exports = router;
