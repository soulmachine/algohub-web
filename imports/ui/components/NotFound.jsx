import React from 'react';
import { FormattedMessage } from 'react-intl';

export default function NotFound() {
  return (
    <div id="page-404">
      <section>
        <h1>404</h1>
        <p><FormattedMessage id="page404.message" defaultMessage="The page your're looking for doesn't exist" /> <a href="/"><FormattedMessage id="page404.return home" defaultMessage="Return to Home" /></a></p>
      </section>
      <style
        dangerouslySetInnerHTML={{
          __html: '#react-content { height: 100%; background-color: #fff }',
        }}
      />
    </div>
  );
}
