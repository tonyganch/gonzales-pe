describe 'scss/nthselector >>', ->
  beforeEach ->
    this.filename = __filename

  it '0.p', ->
    this.shouldBeOk '0'

  it '1.p', ->
    this.shouldBeOk '1'

  it.skip 'c.0.p', ->
    this.shouldBeOk 'c.0'

  it.skip 'c.1.p', ->
    this.shouldBeOk 'c.1'

  it.skip 's.0.p', ->
    this.shouldBeOk 's.0'

  it.skip 's.1.p', ->
    this.shouldBeOk 's.1'
