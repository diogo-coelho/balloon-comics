import { render, screen } from '@testing-library/react';

import { QueryProvider } from '@/providers/query-provider';

describe('QueryProvider', () => {
  it('deve renderizar os componentes filhos dentro do QueryClientProvider', () => {
    render(
      <QueryProvider>
        <span>conteudo da aplicação</span>
      </QueryProvider>,
    );

    expect(screen.getByText('conteudo da aplicação')).toBeInTheDocument();
  });
});
