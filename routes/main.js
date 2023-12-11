module.exports = function(app, garageData) {
    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', garageData)
    });
    app.get('/register', function (req,res) {                                                                    
    });                                                                                                 
    app.post('/registered', function (req,res) {                                                                   
    }); 
    app.get('/login', function (req,res) {                                                                    
    });  

    app.post('/loggedin', function (req,res) {       
    }); 
    app.get('/logout', (req,res) => {
    })
}