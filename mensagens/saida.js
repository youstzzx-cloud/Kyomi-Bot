function montarSaida({ name, memberCount }) {
  return `A Kyomi ficou triste. **${name}** saiu do servidor.\nAgora somos **${memberCount}** membros.`;
}

module.exports = { montarSaida };
