/* Author:

*/

$(function(){
    var trove_api_key = "lb676h2eqpsrtkrc";
    var trove_api_url = "http://api.trove.nla.gov.au/result?zone=newspaper";
    var start_year = 1803;
    var end_year = 1954;
    var current_year = 0;
    var container_width = 940;
    var container_height = 708;
    var div_width = 300;
    var messages = {};
    messages['gt100'] = "Ummm... really... that's your guess? It's much much earlier!";
    messages['gt50'] = "Oh no! You're way off. It's a lot earlier.";
    messages['gt10'] = "Getting close, but it's still quite a bit earlier.";
    messages['gt1'] = "Almost! Try a bit earlier.";
    messages['lt100'] = "Come on, get serious! It's much much later.";
    messages['lt50'] = "Nope, missed the mark there. It's a lot later.";
    messages['lt10'] = "Not bad, but it's still quite a bit later.";
    messages['lt1'] = "So close! Try a bit later.";

    success_messages = [];
    success_messages[1] = 'What! How did you... are you cheating?';
    success_messages[2] = 'The force is strong with this one...';
    success_messages[3] = 'We salute you and your profound temporal knowledge!';
    success_messages[4] = 'Excellent work!';
    success_messages[5] = "Don't get cocky kid...";
    success_messages[6] = 'A good solid effort. Some room for improvement.';
    success_messages[7] = 'Not bad. Needs to pay more attention in class.';
    success_messages[8] = 'You had us worried, but you got there in the end.';
    success_messages[9] = 'Living dangerously huh? You only just made it.';
    success_messages[10] = 'Eeek! A last gasp victory!';

    function get_random_article() {
        $("#headline").text('Choosing a random article...');
        $("#article").showLoading();
        current_year = get_random_year();
        var query = trove_api_url + "&q=date:[" + current_year + " TO " + current_year + "]&n=0&l-category=Article&encoding=json&key=" + trove_api_key;
        get_api_result(query, 'total');
    }
    function get_api_result(query, type) {
        $.ajax({
            "dataType": "jsonp",
            "url": query,
            "success": function(results) {
                process_results(results, type);
            },
            error: function(xmlReq, txtStatus, errThrown){
                $('#status').text(xmlReq.responseText);
            }
        });
    }
    function process_results(results, type) {
        if (type == 'total') {
            var total = results.response.zone[0].records.total;
            var number = Math.floor(Math.random() * total);
            var query = trove_api_url + "&q=date:[" + current_year + " TO " + current_year + "]&s=" + number + "&n=1&l-category=Article&encoding=json&key=" + trove_api_key;
            get_api_result(query, 'article');
        } else if (type == 'article') {
            var article = results.response.zone[0].records.article[0];
            display_article(article);
        }
    }
    function get_random_year() {
        var range = (end_year - start_year) + 1;
        var year = start_year + Math.floor(Math.random() * range);
        return year;
    }
    function display_article(article) {
        $('#headline').html(mask_year(article.heading));
        $('#summary').html(mask_year(article.snippet));
        if (article.title.value.indexOf('(')) {
            newspaper = article.title.value.substr(0, article.title.value.indexOf('(') - 1);
        } else {
            newspaper = article.title.value;
        }
        $('#paper').html(newspaper);
        $('#summary, #paper, #count').show();
        var date = $.format.date(article.date + ' 00:00:00.000', 'd MMMM yyyy');
        var year = article.date.substr(0,4);
        $('#date').text(date);
        $('#article-link').html('<a class="btn btn-mini btn-primary" href="' + article.troveUrl + '">Read article</a>');
        $('#year').data('year', year);
        $("#article").hideLoading();
        $("#year").focus();
    }
    function mask_year(text) {
        text = text.replace(year, '****');
        return text;
    }
    function guess() {
        var guess = $("#year").val();
        var guesses = $("#guesses").data("guesses") + 1;
        if (guess == $("#year").data('year')) {
            correct(guesses);
        } else {
            if (guesses < 10) {
                give_message(guess, guesses);
                $("#guesses").data("guesses", guesses);
                $("#guesses").text(10 - guesses);
                if (guesses == 4) {
                    $("#text-guesses").removeClass('status-ok').addClass('status-warning');
                    $("#count").removeClass('border-ok').addClass('border-warning');
                } else if (guesses == 7) {
                    $("#text-guesses").removeClass('status-warning').addClass('status-danger');
                    $("#count").removeClass('border-warning').addClass('border-danger');
                }
                if (guesses == 9) {
                    $("#text-guesses").text('guess left');
                }
                $("#year").focus();
            } else {
                $("#text-guesses").text('guesses left');
                fail();
            }

        }
    }
    function correct(guesses) {
        $("#status").html("<b>That's it!</b><br>" + success_messages[guesses]).removeClass("alert-error").addClass("alert-success");
        $("#pub_details").show();
    }
    function give_message(guess, guesses) {
        var year = $("#year").data('year');
        var difference = parseInt(guess, 10) - year;
        var message;
        if (difference >= 100) {
            message = messages['gt100'];
        } else if (difference < 100 && difference >= 50) {
            message = messages['gt50'];
        } else if (difference < 50 && difference >= 10) {
            message = messages['gt10'];
        } else if (difference < 10 && difference >= 1) {
            message = messages['gt1'];
        } else if (difference <= -100) {
            message = messages['lt100'];
        } else if (difference > -100 && difference <= -50) {
            message = messages['lt50'];
        } else if (difference > -50 && difference <= -10) {
            message = messages['lt10'];
        } else if (difference > -10 && difference <= -1) {
            message = messages['lt1'];
        }
        $("#status").removeClass('alert-success').addClass('alert-error').text(message);

    }
    function fail() {
        $("#guesses").text(0);
        $("#status").text("Ooops! Follow the link to read the article, or hit reload to try again.");
        $("#pub_details").show();
    }
    function reset() {
        $("#year").val("");
        $("#headline").text('Choosing a random article...');
        $("#guesses").data("guesses", 0).text(10);
        $("#text-guesses").removeClass('status-warning status-danger').addClass('status-ok');
        $("#count").removeClass('border-warning border-danger').addClass('border-ok');
        $("#summary").empty();
        $("#paper").empty();
        $("#pub_details").hide();
        $("#status").removeClass("alert-error").addClass("alert-success").text('Can you guess when this article was published?');
        get_random_article();
    }
    $('#year').keydown(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            guess();
        }
    });
    $("#guess-button").button().click(function() { guess(); });
    $("#reload-button").button().click(function() { reset(); });
    $("#guesses").data("guesses", 0);
    $("#pub_details").hide();
    get_random_article();
});


