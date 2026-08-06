import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding banco de dados...");

  const passwordHash = await bcrypt.hash("123456", 10);

  const empresa = await prisma.empresa.upsert({
    where: { id: "empresa-demo" },
    update: {},
    create: {
      id: "empresa-demo",
      nome: "Bambuí Bioenergia S/A",
      cnpj: "00.000.000/0001-00",
      diasAvisoTroca: 30,
      unidades: {
        create: [{ nome: "Matriz" }, { nome: "Unidade Industrial" }],
      },
      users: {
        create: {
          name: "Administrador",
          email: "admin@demo.com",
          passwordHash,
          role: "admin",
        },
      },
    },
    include: { unidades: true },
  });

  const [matriz, unidadeIndustrial] = empresa.unidades;

  const itens = await Promise.all(
    [
      { nome: "Capacete de Segurança 3M H-700", ca: "29638", fabricante: "3M", categoriaNR: "EPI (NR-6) • Proteção do crânio", custoUnitario: 35.9, periodicidadeDias: 730, estoqueAtual: 40, estoqueMinimo: 10 },
      { nome: "Óculos de Proteção Steel Pro", ca: "17772", fabricante: "Steel Pro", categoriaNR: "EPI (NR-6) • Proteção ocular", custoUnitario: 12.5, periodicidadeDias: 180, estoqueAtual: 60, estoqueMinimo: 15 },
      { nome: "Luva de Raspa de Couro", ca: "34567", fabricante: "Volk", categoriaNR: "EPI (NR-6) • Proteção das mãos", custoUnitario: 18.0, periodicidadeDias: 90, estoqueAtual: 8, estoqueMinimo: 20 },
      { nome: "Protetor Auricular Plug", ca: "5745", fabricante: "3M", categoriaNR: "EPI (NR-6) • Proteção auditiva", custoUnitario: 3.2, periodicidadeDias: 60, estoqueAtual: 100, estoqueMinimo: 30 },
      { nome: "Botina de Segurança com Bico PVC", ca: "41123", fabricante: "Vulcabras", categoriaNR: "EPI (NR-6) • Proteção dos pés", custoUnitario: 89.9, periodicidadeDias: 365, estoqueAtual: 25, estoqueMinimo: 10 },
    ].map((data) => prisma.itemEPI.create({ data: { ...data, empresaId: empresa.id } }))
  );

  const [capacete, oculos, luva, protetorAuricular, botina] = itens;

  // Setores com os EPIs obrigatórios definidos
  const setorProducao = await prisma.setor.create({
    data: {
      nome: "Produção",
      empresaId: empresa.id,
      itensObrigatorios: {
        create: [{ itemId: capacete.id }, { itemId: oculos.id }, { itemId: protetorAuricular.id }, { itemId: botina.id }],
      },
    },
  });

  const setorManutencao = await prisma.setor.create({
    data: {
      nome: "Manutenção",
      empresaId: empresa.id,
      itensObrigatorios: {
        create: [{ itemId: capacete.id }, { itemId: luva.id }, { itemId: botina.id }],
      },
    },
  });

  const setorSSMA = await prisma.setor.create({
    data: {
      nome: "SSMA",
      empresaId: empresa.id,
      itensObrigatorios: {
        create: [{ itemId: oculos.id }],
      },
    },
  });

  // Catálogo de treinamentos e vínculo com os setores
  const treinamentos = await Promise.all(
    [
      { nome: "Integração de Segurança", descricao: "Treinamento introdutório obrigatório para todos os colaboradores.", cargaHorariaHoras: 4, periodicidadeDias: null },
      { nome: "NR-35 Trabalho em Altura", descricao: "Capacitação para atividades acima de 2m de altura.", cargaHorariaHoras: 8, periodicidadeDias: 730 },
      { nome: "NR-10 Segurança em Instalações Elétricas", descricao: "Obrigatório para quem atua em instalações e serviços com eletricidade.", cargaHorariaHoras: 40, periodicidadeDias: 730 },
      { nome: "Brigada de Incêndio", descricao: "Combate a princípio de incêndio e abandono de área.", cargaHorariaHoras: 16, periodicidadeDias: 365 },
    ].map((data) => prisma.treinamentoCatalogo.create({ data: { ...data, empresaId: empresa.id } }))
  );
  const [integracao, nr35, nr10, brigada] = treinamentos;

  await prisma.setorTreinamento.createMany({
    data: [
      { setorId: setorProducao.id, treinamentoId: integracao.id },
      { setorId: setorProducao.id, treinamentoId: brigada.id },
      { setorId: setorManutencao.id, treinamentoId: integracao.id },
      { setorId: setorManutencao.id, treinamentoId: nr35.id },
      { setorId: setorManutencao.id, treinamentoId: nr10.id },
      { setorId: setorSSMA.id, treinamentoId: integracao.id },
      { setorId: setorSSMA.id, treinamentoId: brigada.id },
    ],
  });

  const colaboradores = await Promise.all(
    [
      { nome: "João da Silva", matricula: "FUNC001", cpf: "111.111.111-11", cargo: "Operador de Produção", setorId: setorProducao.id, unidadeId: unidadeIndustrial.id },
      { nome: "Maria Oliveira", matricula: "FUNC002", cpf: "222.222.222-22", cargo: "Técnica de Segurança", setorId: setorSSMA.id, unidadeId: matriz.id },
      { nome: "Carlos Souza", matricula: "FUNC003", cpf: "333.333.333-33", cargo: "Eletricista", setorId: setorManutencao.id, unidadeId: unidadeIndustrial.id },
    ].map((data) => prisma.colaborador.create({ data: { ...data, empresaId: empresa.id } }))
  );

  const [joao, maria, carlos] = colaboradores;

  // Realizações de treinamento — um cenário de cada status pra popular o painel:
  // João: integração feita há tempo (ok) + brigada vencendo em breve (atenção)
  await prisma.treinamentoRealizacao.create({
    data: {
      empresaId: empresa.id,
      colaboradorId: joao.id,
      treinamentoId: integracao.id,
      realizadoEm: new Date(Date.now() - 400 * 86400000),
      validoAte: null,
      instrutor: "SESI",
    },
  });
  await prisma.treinamentoRealizacao.create({
    data: {
      empresaId: empresa.id,
      colaboradorId: joao.id,
      treinamentoId: brigada.id,
      realizadoEm: new Date(Date.now() - 360 * 86400000),
      validoAte: new Date(Date.now() + 5 * 86400000),
      instrutor: "Corpo de Bombeiros",
    },
  });

  // Carlos: NR-10 em dia, NR-35 vencida, integração pendente (nunca fez)
  await prisma.treinamentoRealizacao.create({
    data: {
      empresaId: empresa.id,
      colaboradorId: carlos.id,
      treinamentoId: nr10.id,
      realizadoEm: new Date(Date.now() - 30 * 86400000),
      validoAte: new Date(Date.now() + 700 * 86400000),
      instrutor: "SENAI",
    },
  });
  await prisma.treinamentoRealizacao.create({
    data: {
      empresaId: empresa.id,
      colaboradorId: carlos.id,
      treinamentoId: nr35.id,
      realizadoEm: new Date(Date.now() - 800 * 86400000),
      validoAte: new Date(Date.now() - 70 * 86400000),
      instrutor: "SENAI",
    },
  });
  // (integração fica pendente de propósito, pra aparecer no painel)

  // Solicitação + entrega já concluída e assinada, para popular a Ficha de EPI de exemplo
  const solicitacao = await prisma.solicitacao.create({
    data: {
      empresaId: empresa.id,
      colaboradorId: joao.id,
      motivo: "Primeira entrega",
      status: "entregue",
      itens: {
        create: [
          { itemId: capacete.id, quantidade: 1 },
          { itemId: oculos.id, quantidade: 1 },
          { itemId: luva.id, quantidade: 2 },
        ],
      },
    },
  });

  const entrega = await prisma.entrega.create({
    data: {
      empresaId: empresa.id,
      solicitacaoId: solicitacao.id,
      colaboradorId: joao.id,
      assinado: true,
      assinaturaTipo: "manual",
      assinadoEm: new Date(),
      itens: {
        create: [
          { itemId: capacete.id, quantidade: 1, proximaTroca: new Date(Date.now() + 730 * 86400000) },
          { itemId: oculos.id, quantidade: 1, proximaTroca: new Date(Date.now() + 180 * 86400000) },
          // Proposital: essa luva vence em breve, pra aparecer no aviso de troca do dashboard
          { itemId: luva.id, quantidade: 2, proximaTroca: new Date(Date.now() + 5 * 86400000) },
        ],
      },
    },
    include: { itens: true },
  });

  // Solicitação pendente, para popular a tela de Solicitações
  await prisma.solicitacao.create({
    data: {
      empresaId: empresa.id,
      colaboradorId: maria.id,
      motivo: "Troca periódica",
      status: "pendente",
      itens: { create: [{ itemId: oculos.id, quantidade: 1 }] },
    },
  });

  // Devolução de exemplo (apenas histórico — não mexe no estoque)
  const luvaEntregaItem = entrega.itens.find((i) => i.itemId === luva.id)!;
  await prisma.devolucao.create({
    data: {
      empresaId: empresa.id,
      colaboradorId: joao.id,
      itemId: luva.id,
      entregaItemId: luvaEntregaItem.id,
      quantidade: 1,
      motivo: "Item danificado",
      observacao: "Uma das luvas rasgou durante o uso.",
    },
  });

  console.log("Seed concluído.");
  console.log("Login de teste -> e-mail: admin@demo.com | senha: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
