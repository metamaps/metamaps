import React, { Component } from 'react'

class NewAuthorization extends Component {
  render = () => {
    return (
      <div id="yield">
        <div className="centerContent">
          <header className="page-header" role="banner">
            <h1>Authorization required</h1>
          </header>
          <main role="main">
            <p className="h4">
              Authorize <strong className="text-info">Test</strong> to use your account?
            </p>
            <div className="actions">
              <div className="inline-button button-margin-top">
                <form action="/oauth/authorize" accept-charset="UTF-8" method="post">
                  <input name="utf8" type="hidden" value="✓" />
                  <input type="hidden" name="client_id" id="client_id" value="61b402af2af8671ae8c282cb32938de3aac7b8241e0c4c5a89af488a97c6157c" />
                  <input type="hidden" name="redirect_uri" id="redirect_uri" value="urn:ietf:wg:oauth:2.0:oob" />
                  <input type="hidden" name="state" id="state" />
                  <input type="hidden" name="response_type" id="response_type" value="code" />
                  <input type="hidden" name="scope" id="scope" value="" />
                  <input type="submit" name="commit" value="Authorize" className="button" data-disable-with="Authorize" />
                </form>
              </div>
              <div className="inline-button button-margin-top">
                <form action="/oauth/authorize" accept-charset="UTF-8" method="post">
                  <input name="utf8" type="hidden" value="✓" />
                  <input type="hidden" name="_method" value="delete" />
                  <input type="hidden" name="client_id" id="client_id" value="61b402af2af8671ae8c282cb32938de3aac7b8241e0c4c5a89af488a97c6157c" />
                  <input type="hidden" name="redirect_uri" id="redirect_uri" value="urn:ietf:wg:oauth:2.0:oob" />
                  <input type="hidden" name="state" id="state" />
                  <input type="hidden" name="response_type" id="response_type" value="code" />
                  <input type="hidden" name="scope" id="scope" value="" />
                  <input type="submit" name="commit" value="Deny" className="button red-button" data-disable-with="Deny" />
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }
}

export default NewAuthorization