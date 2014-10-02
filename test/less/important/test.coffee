describe.skip 'less/important >>', ->
  beforeEach ->
    this.filename = __filename

  it '0.p', ->
    this.shouldBeOk '0'

  it 'c.0.p', ->
    this.shouldBeOk 'c.0'

  it 's.0.p', ->
    this.shouldBeOk 's.0'
