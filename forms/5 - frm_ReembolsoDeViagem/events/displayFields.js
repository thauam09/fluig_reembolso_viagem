function displayFields(form, customHTML) {
  var atividade = getValue("WKNumState");
  var inicio = 4;
  
  if (atividade == 0 || atividade == inicio) {
    var usuario = getValue("WKUser");
    var infoUsuario = getInfoUsuario(usuario);

    form.setValue("nome", infoUsuario.nome);
    form.setValue("matricula", infoUsuario.matricula);
  } else {
    var camposParaDesabilitar = ["motivo"];
    var camposPaiFilhoParaDesabilitar = ["endereco"];
    var botoesParaDesabilitar = [
      "adicionar_endereco",
      "pesquisar_destino",
      "delete_endereco",
    ];

    desabilitarCampos(camposParaDesabilitar, form);
    desabilitarCamposPaiFilho(camposPaiFilhoParaDesabilitar, "destinos");
    desabilitarBotoes(botoesParaDesabilitar);
  }

  function desabilitarBotoes(botoes) {
    customHTML.append("<script language='javascript' /> \n ");

    for (var i = 0; i < botoes.length; i++) {
      customHTML.append("$('button[id=" + botoes[i] + "]').prop('disabled', true); \n");
    }

    customHTML.append("</script>");
  }

  function desabilitarCampos(campos, form) {
    for (var i = 0; i < campos.length; i++) {
      form.setEnabled(campos[i], false);
    }
  }

  function desabilitarCamposPaiFilho(campos, nomeTabela) {
    var indexesTabela = form.getChildrenIndexes(nomeTabela);

    for (var ic = 0; ic < campos.length; ic++) {
      for (var it = 0; it < indexesTabela.length; it++) {
        form.setEnabled(campos[ic] + "___" + indexesTabela[it], false);
      }
    }
  }

  function getInfoUsuario(usuario) {
    var constraint = DatasetFactory.createConstraint(
      "colleaguePK.colleagueId",
      usuario,
      usuario,
      ConstraintType.MUST
    );

    var resposta = DatasetFactory.getDataset(
      "colleague",
      null,
      new Array(constraint),
      null
    );

    return {
      nome: resposta.getValue(0, "colleagueName"),
      matricula: resposta.getValue(0, "colleaguePK.colleagueId"),
    };
  }
}

