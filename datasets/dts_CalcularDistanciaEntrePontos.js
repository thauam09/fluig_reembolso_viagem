function defineStructure() {
  addColumn("origin");
  addColumn("destination");
  addColumn("waypoints");
  addColumn("distanceInKm", DatasetFieldType.NUMBER);
  addColumn("response");
}

function onSync(lastSyncDate) {}

function createDataset(fields, constraints, sortFields) {
  var clientService = fluigAPI.getAuthorizeClientService();
  var origin = "";
  var destination = "";
  var waypoints = new Array();

  if (constraints.length > 0) {
    for (var i = 0; i < constraints.length; i++) {
      if (constraints[i].fieldName == "origin") {
        origin = constraints[i].initialValue;
      } else if (constraints[i].fieldName == "destination") {
        destination = constraints[i].initialValue;
      } else if (constraints[i].fieldName == "waypoints") {
        waypoints.push(constraints[i].initialValue);
      }
    }
  }

  var data = {
    companyId: getValue("WKCompany") + "",
    serviceCode: "WS_GoogleDistanceMatrixAPI",
    endpoint: montarRequisicao(origin, destination, waypoints),
    method: "get", // 'delete', 'patch', 'put', 'get'
    timeoutService: "100", // segundos
    params: {},
    options: {
      encoding: "UTF-8",
      mediaType: "application/json",
      useSSL: true,
    },
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
  };

  var vo = clientService.invoke(JSON.stringify(data));
  var response = vo.getResult();
  var responseJSON = JSON.parse(response);

  if (response == null || response.isEmpty()) {
    throw new Exception("Retorno está vazio");
  } else {
    log.info("------------ dts_CalcularDistanciaEntrePontos -------------");
    log.info(response);
    var dataset = DatasetBuilder.newDataset();
    dataset.addColumn("origin");
    dataset.addColumn("destination");
    dataset.addColumn("waypoints");
    dataset.addColumn("distanceInKm");
    dataset.addColumn("response");

    var row = new Array();
    row.push(responseJSON.origin_addresses[0]);
    row.push(responseJSON.destination_addresses[responseJSON.destination_addresses.length - 1]);
    row.push(responseJSON.origin_addresses.slice(1).join(";"));
    row.push(calcularDistanciaTrajeto(responseJSON));
    row.push(response);

    dataset.addRow(row);
    return dataset;
  }
}

function onMobileSync(user) {}

function montarRequisicao(origin, destination, waypoints) {
  var key = "YOUR_API_KEY_HERE";
  var units = "metric";

  var origins = "";
  var destinations = "";

  if (waypoints.length > 0) {
    origins = origin + "|" + waypoints.join("|");
    destinations = waypoints.join("|") + "|" + destination;
  } else {
    origins = origin;
    destinations = destination;
  }

  var requisicao = "/json?origins=" + origins + "&destinations=" + destinations + "&key=" + key + "&units=" + units;
  log.info("requisicao -> " + encodeURI(requisicao));
  return encodeURI(requisicao);
}

function calcularDistanciaTrajeto(response) {
  var rows = response.rows;
  var somaDistancias = 0;
  
  for (var i = 0; i < rows.length; i++) {
    var valor = rows[i].elements[i].distance.value;
    log.info("valor -> " + valor);
    somaDistancias += valor;
  }
  
  log.info("soma valor -> " + somaDistancias / 1000);
  return somaDistancias / 1000;
}
