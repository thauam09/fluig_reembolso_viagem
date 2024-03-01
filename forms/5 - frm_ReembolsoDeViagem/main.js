$(document).ready(function () {
  setIndexBotaoDeletePaiFilhoDestinos();
});

function deleteDestino(oElement) {
  fnWdkRemoveChild(oElement);
}

function calcularDistancia() {
  var origin = "";
  var destination = "";
  var waypoints = [];
  var enderecos = $("input[id^=endereco___]");

  enderecos.each(function (index, element) {
    switch (index) {
      case 0:
        origin = element.value;
        break;
      case enderecos.length - 1:
        destination = element.value;
        break;
      default:
        waypoints.push(element.value);
        break;
    }
  });

  var constraintOrigin = DatasetFactory.createConstraint("origin", origin, origin, ConstraintType.MUST);
  var constraintDestination = DatasetFactory.createConstraint("destination", destination, destination, ConstraintType.MUST);
  var constraintsWaypoints = waypoints.map((waypoint) => {
    return DatasetFactory.createConstraint(
      "waypoints",
      waypoint,
      waypoint,
      ConstraintType.MUST
    );
  });

  var dataset = DatasetFactory.getDataset("dts_CalcularDistanciaEntrePontos", null, [constraintOrigin, constraintDestination, ...constraintsWaypoints], null);

  var values = dataset.values;
  var waypointsValues = dataset.values[0].waypoints.split(";");

  $(enderecos[0]).val(values[0].origin);
  $(enderecos[enderecos.length - 1]).val(values[0].destination);

  $.each(enderecos, function (index, element) {
    if (index !== 0 && index !== enderecos.length - 1) {
      $(element).val(waypointsValues[index - 1]);
    }
  })

  var taxaKmReembolso = 0.85;
  var distanceInKm = Number(values[0].distanceInKm).toFixed(2);
  $("#distancia_total").val(distanceInKm);
  $("#valor_reembolso").val((Number(distanceInKm) * taxaKmReembolso).toFixed(2));
}

function setIndexBotaoDeletePaiFilhoDestinos() {
  var indexesDestinos = []
  
  $("input[id^=endereco___]").each(function (index, element) {
    var id = element.id;
    var index = id.split("___")[1];
    indexesDestinos.push(index);
  });

  $('button[id=delete_endereco]').each(function (index, element) {
    if (index === 0) return;
    element.id = `delete_endereco___${indexesDestinos[index - 1]}`;
  });
}
