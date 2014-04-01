describe 'sass/declaration >>', ->
  beforeEach ->
    this.filename = __filename

  it '0.p', ->
    this.shouldBeOk '0'

  it '1.p', ->
    this.shouldBeOk '0'

  it 'c.0.p', ->
    this.shouldBeOk '0'

  it 'c.1.p', ->
    this.shouldBeOk '0'

  it 'c.2.p', ->
    this.shouldBeOk '0'

  it 'c.3.p', ->
    this.shouldBeOk '0'

  it 's.0.p', ->
    this.shouldBeOk '0'

  it 's.1.p', ->
    this.shouldBeOk '0'

  it 's.2.p', ->
    this.shouldBeOk '0'

  it 's.3.p', ->
    this.shouldBeOk '0'
