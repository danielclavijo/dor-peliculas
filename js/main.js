var apiData = [];
var votingInfo = [];
var $loading = $("#spinnerDiv").hide();
var chart;
var data;
var movieIndex = 0;
var tabIndex = 0;
var leerChart = "";
var voteCondition = 0;
var options = {
    title: 'Votos por película',
    is3d : 'true',
    chartArea: {left:10,top:40,width:'100%',height:'100%'}
}

$(document).ready(function(){

    buttonListener();

    votingInfo.push(["Nombre","Votos"]);

    loadMovies();
    google.charts.load("current",{packages:["corechart", "bar"]});

});

$(document).ajaxStart(function(){ $loading.show();})
        .ajaxStop(function(){ $loading.hide();});

function loadMovies(){
    $.ajax({url: "https://gateway.marvel.com:443/v1/public/comics?formatType=collection&noVariants=false&limit=10&apikey=e79c536b35f3ade7b2196c7d7428618a",
        dataType: "json",
        success: function(result){

            apiData = result.data;

            for (var i = 0; i < 10; i++) {

                votingInfo.push([apiData.results[i].title]);

                var movieDiv = $("<div></div>",{'class': 'movie','id':'movie'+i,'aria-label':apiData.results[i].title,'tabindex':i}).appendTo("#movieWrapper")
                    .append($('<img>',{'src':  apiData.results[i].thumbnail.path + "." + apiData.results[i].thumbnail.extension}));

                    $("<div class='info-div' id='info" + i +"'><b>Título:</b> " + apiData.results[i].title +
                    "<br><br><b>Descripción:</b> " + apiData.results[i].description +
                    "</div>").addClass("movie-data").appendTo('#movie' + i);

                    var movieButton = $("<div class='vote-button' id='button" + i +"'><img class='svg-icon' src='img/vote.svg'> <b>VOTAR</b></div>").appendTo("#info" + i);

                $(movieDiv).appendTo("#movieWrapper").click(function(){
                    var $clicked = $(this).children().filter(".movie-data");
                    //esconder todos menos el elegido
                    $(".movie-data").not($clicked).hide();
                    $clicked.toggle("slow");
                });

                $(movieButton).click(function(){

                    var id = $(this).attr('id').slice(-1);

                    var page = $("<div class='vote-page'><p><b>Votar por: </b>" + apiData.results[id].title + "</p>").appendTo("#movieWrapper");
                    $("#closeButton").show();

                    $("#googleChart").appendTo(page);
                    //var chartDiv = $("<div id='googleChart'></div>").appendTo(page);
                    drawChart(votingInfo);
                    $("#pieChart").appendTo(page).show();
                    $("#barChart").appendTo(page).show();
                    $("#closeButton").appendTo(page).show();
                    $("#closeButton").attr('tabindex','4');

                    $("#loginForm").appendTo(page);

                    //var boton = $("<img class='svg-icon' src='img/vote.svg' aria-label='Guardar Votación' tabindex='" + movieIndex + 4 + "'>").attr('id', id).appendTo(page);
                    var boton = $("#guardarVoto");
                    voteCondition = 1;
                    boton.click(function(){

                        closeVoting();

                        var name = $("#name").val();
                        var email = $("#email").val();
                        var address = $("#address").val();
                        var idMovie = $(this).attr('id');
                        if(name != "" && email != "" && address != ""){
                            if(localStorage.votaciones){
                                if(localStorage.votaciones.indexOf(email) == -1){
                                    localStorage.votaciones = localStorage.votaciones + name + "," + email + "," + address + "," + idMovie + "##";
                                }
                                else {
                                    alert("Ese usuario ya existe");
                                }
                            }
                            else{
                                localStorage.votaciones = name + "," + email + "," + address + "," + idMovie + "##";
                            }
                        } else{
                            alert("Datos incorrectos");
                        }

                    });
                    //$("#closeButton").appendTo(page);

                    $("#closeButton").click(function(){closeVoting();});
                    $("#pieChart").click(function(){drawPieChart();});
                    $("#barChart").click(function(){drawBarChart();});


                    $("#loginForm").show();

                    page.toggle("slow");

                });
            }

    },
    complete: function(){google.charts.setOnLoadCallback(chartInfo);}});

}

function chartInfo(){
    var cont = 0;
    $.getJSON("data/votes.json", function(data){

        $.each(data, function(key,val){

            votingInfo[cont+1].push(val);
            cont++;
        });

        var ids = [];
        if(localStorage.votaciones)
            ids = localStorage.votaciones.split("##");
        console.log(ids);

        for(var i = 0; i < ids.length; i++){
            if(ids[i].length > 2)
                var idVote = ids[i].slice(-1);
            if(!isNaN(idVote))
                votingInfo[((+idVote)+1)][1]++;
        }

    });

}

function closeVoting(){
    $(".vote-page").hide();
}

function drawChart(chartInfo){
    //updateInfo();
    data = new google.visualization.arrayToDataTable(chartInfo);

    chart = new google.visualization.PieChart(document.getElementById("googleChart"));
    chart.draw(data, options);
}

function drawPieChart(){
    //updateInfo();
    chart = new google.visualization.PieChart(document.getElementById("googleChart"));
    chart.draw(data, options);
}

function drawBarChart(){
    //updateInfo();
    chart = new google.visualization.ColumnChart(document.getElementById("googleChart"));
    chart.draw(data, options);
}


function buttonListener(){
    $(document).keydown((event) => {
        if(event.which == 9 || event.keycode == 9){
            movieIndex++;
        }
    });


    $(document).keydown((event) => {
        var buttonDisplay = $("#guardarVoto").css('display');
        if((event.which == 13 || event.keycode == 13) && buttonDisplay == "none"){
            {
                tabiIndex = movieIndex;
                var id = movieIndex -1;
                tabIndex = movieIndex;
                var page = $("<div class='vote-page'><p><b>Votar por: </b>" + apiData.results[id].title + "</p>").appendTo("#movieWrapper");
                $("#closeButton").show();

                $("#googleChart").appendTo(page);
                for (var i = 1; i < votingInfo.length; i++){
                    leerChart += votingInfo[i][0] +", Votos: " + votingInfo[i][1] + ". ";
                }
                $("#googleChart").attr('aria-label',leerChart);
                $("#googleChart").attr('tabindex','10');
                //var chartDiv = $("<div id='googleChart'></div>").appendTo(page);
                drawChart(votingInfo);
                $("#pieChart").appendTo(page).show();
                $("#barChart").appendTo(page).show();
                $("#closeButton").appendTo(page).show();
                $("#closeButton").attr('tabindex','4');
                $("#loginForm").appendTo(page);
                voteCondition = 1;
                //var boton = $("<img class='svg-icon' src='img/vote.svg' aria-label='Guardar Votación' tabindex='" + movieIndex + 4 + "'>").attr('id', id).appendTo(page);

                var boton = $("#guardarVoto");
                $("#guardarVoto").show();
                boton.click(function(){

                    closeVoting();

                    var name = $("#name").val();
                    var email = $("#email").val();
                    var address = $("#address").val();
                    var idMovie = $(this).attr('id');
                    if(name != "" && email != "" && address != ""){
                        if(localStorage.votaciones){
                            if(localStorage.votaciones.indexOf(email) == -1){
                                alert("Ha votado");
                                localStorage.votaciones = localStorage.votaciones + name + "," + email + "," + address + "," + idMovie + "##";
                            }
                            else {
                                alert("Ese usuario ya existe");
                            }
                        }
                        else{
                            alert("Ha votado");
                            localStorage.votaciones = name + "," + email + "," + address + "," + idMovie + "##";
                        }
                    } else{
                        alert("Datos incorrectos");
                    }

                });
                //$("#closeButton").appendTo(page);

                $("#closeButton").click(function(){closeVoting();});
                $("#pieChart").click(function(){drawPieChart();});
                $("#barChart").click(function(){drawBarChart();});


                $("#loginForm").show();

                page.toggle("slow");

            }
        } else if((event.which == 13 || event.keycode == 13) && buttonDisplay == "inline" && voteCondition == 1){
            closeVoting();

            var name = $("#name").val();
            var email = $("#email").val();
            var address = $("#address").val();
            var idMovie = tabIndex - 1;
            if(name != "" && email != "" && address != ""){
                if(localStorage.votaciones){
                    if(localStorage.votaciones.indexOf(email) == -1){
                        alert("Ha votado");
                        localStorage.votaciones = localStorage.votaciones + name + "," + email + "," + address + "," + idMovie + "##";
                    }
                    else {
                        alert("Ese usuario ya existe");
                    }
                }
                else{
                    alert("Ha votado");
                    localStorage.votaciones = name + "," + email + "," + address + "," + idMovie + "##";
                }
            } else{
                alert("Datos incorrectos");
            }
        }
    })

}
/*function updateInfo(){

}
*/
