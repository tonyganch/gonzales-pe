describe.skip 'sass/atruleb >>', ->
  beforeEach ->
    this.filename = __filename

  it '0.p', ->
    this.shouldBeOk '0'

  it '1.p', ->
    this.shouldBeOk '1'

  it '2.p', ->
    this.shouldBeOk '2'

  it 'c.0.p', ->
    this.shouldBeOk 'c.0'

  it 'c.1.p', ->
    this.shouldBeOk 'c.1'

  it 'c.2.p', ->
    this.shouldBeOk 'c.2'

  it 's.0.p', ->
    this.shouldBeOk 's.0'

  it 's.1.p', ->
    this.shouldBeOk 's.1'

  it 's.2.p', ->
    this.shouldBeOk 's.2'
