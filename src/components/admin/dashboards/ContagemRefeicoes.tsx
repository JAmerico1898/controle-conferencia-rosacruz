export function ContagemRefeicoes({
  contagem,
}: {
  contagem: Record<string, number>;
}) {
  const linhas: [string, number][] = [
    ["Almoço de sábado", contagem.almoco_sabado],
    ["Jantar de sábado", contagem.jantar_sabado],
    ["Café da manhã de domingo", contagem.cafe_domingo],
    ["Lanche de domingo", contagem.lanche_domingo],
  ];
  return (
    <table className="w-full text-sm">
      <tbody>
        {linhas.map(([rotulo, n]) => (
          <tr key={rotulo} className="border-b border-rule/60">
            <td className="py-2">{rotulo}</td>
            <td className="text-right num font-display text-2xl">{n}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
