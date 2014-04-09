describe 'sass/ruleset >>', ->
  beforeEach ->
    this.filename = __filename

  it '0.p', ->
    this.shouldBeOk '0'

  it '1.p', ->
    this.shouldBeOk '1'

  it '2.p', ->
    this.shouldBeOk '2'

  it '3.p', ->
    this.shouldBeOk '3'

  it '4.p', ->
    this.shouldBeOk '4'

  it '5.p', ->
    this.shouldBeOk '5'

  it 'c.0.p', ->
    this.shouldBeOk 'c.0'

  it.skip 'c.1.p', ->
    this.shouldBeOk 'c.1'

  it.skip 'c.2.p', ->
    this.shouldBeOk 'c.2'

  it.skip 'c.3.p', ->
    this.shouldBeOk 'c.3'

  it.skip 'color.ident.0.p', ->
    this.shouldBeOk 'color.ident.0'

  it.skip 'color.ident.1.p', ->
    this.shouldBeOk 'color.ident.1'

  it.skip 's.0.p', ->
    this.shouldBeOk 's.0'

  it.skip 's.1.p', ->
    this.shouldBeOk 's.1'

  it.skip 's.2.p', ->
    this.shouldBeOk 's.2'

  it.skip 's.3.p', ->
    this.shouldBeOk 's.3'

  it.skip 's.4.p', ->
    this.shouldBeOk 's.4'

  it.skip 's.5.p', ->
    this.shouldBeOk 's.5'
