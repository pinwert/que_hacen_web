(function($){
    $( document ).ready(function() {
        autocomplete($('.autocomplete'));
    });

    function autocomplete($this){
        var data = $this.data(),
            recuperar_datos = function(ids){
                var aux = [];
                $.ajax({
                    type: 'GET',
                    url: data.jsonurl,
                    data: {values:ids},
                    success: function(response){
                        $.each(response,function(i,a){
                            aux.push($.extend({id: a.value,text: a.label},a));
                        });
                    },
                    dataType: 'json',
                    async:false
                });
                return aux;
            };
        this.opciones = {
            width: data.width || 'resolve',
            placeholder: "Buscar...",
            minimumInputLength: 1,
            dropdownAutoWidth: true,
            formatNoMatches: function(term){
                return '<li class="select2-no-results">No existen resultados</li>';
            },
            formatSearching: function(){
                return '<li class="select2-searching">Buscando...</li>';
            },
            formatInputTooShort: function(term, minLength){
                return '<li class="select2-no-results">Por favor introduzca al menos '+minLength+' '+ (minLength == 1 ? 'caracter': 'caracteres')+'</li>';
            },
            formatSelectionTooBig: function(maxSize){
                return '<li class="select2-selection-limit">Sólo puede seleccionar '+maxSize+' '+ (maxSize == 1 ? 'elemento': 'elementos')+'</li>';
            },
            formatLoadMore: function (pageNumber) {
                return 'Cargando más resultados...';
            },
            triggerChange: true,
            maximumSelectionSize:1,
            ajax: {
                url: function (term, page) {
                    return data.url+'?q='+term;
                },
                type: 'GET',
                dataType: 'json',
                data:  function (term, page) {
                    var values = [];
                    $("#autocomplete_"+data.autocomplete).children('input').each(function(key,elements){values.push($(elements).val())});
                    return {
                        values: values.length < 1 ? [""] : values
                    };
                },
                results: function (data, page) {
                    return { results: data };
                }
            },
            formatAjaxError: function(jqXHR, textStatus, errorThrown){
                return 'Error en la carga.'
            },
            initSelection: function(element, callback) {
                var datos = window['values_'+data.autocomplete]();
                if(element.val() != ''){
                    if (datos == undefined) datos = [];
                    else if (!$.isArray(datos)) datos = [datos];
                    $(element.val().split( /,\s*/ )).each(function(i,b){
                        var no_esta = 1;
                        $(datos).each(function(i,a){
                            if(a.id == b){
                                no_esta = 0;
                                return 0;
                            }
                        });
                        if(no_esta){
                            datos.push(recuperar_datos(b).length && recuperar_datos(b)[0]);
                        }
                    });
                }
                if(datos && datos.length != 0){
                    callback(datos);
                }
                else{
                    //  element.val('');
                }
            },
            multiple: true,
            'createSearchChoice': function(term, data) {
                if ($(data).filter(function() { return this.text.localeCompare(term)===0; }).length===0) {
                    return {id:term, text:term};
                }
            },
            'createSearchChoicePosition': function(list, item) {
                list.splice(0, 0, item);
            }
        };
        if(data.template.length > 0){
            $.extend(this.opciones, {'formatResult': $mf.autocomplete[data.template], 'formatSelection': $mf.autocomplete[data.template]});
        }
        if(data.resultslist){
            $.extend(this.opciones, {
                'resultsList': $(data.resultslist),
                'closeOnSelect': false
            });
        }
        function seleccionar(e){
            if(e.val[0].substring(0,1) == '/' || e.val[0].substring(0,7) == 'http://'){
                window.location.href = e.val[0];
            }
            else{
                window.location.href = '/search?q='+e.val[0];
            }
        }
        $this.select2(this.opciones)
            .on('change', seleccionar);
    };
})($);