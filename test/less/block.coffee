describe 'less/block >>', ->
  beforeEach ->
    this.filename = __filename

  it '0.p', ->
    this.shouldBeOk '0'

  it '1.p', ->
    this.shouldBeOk '0'

  it '2.p', ->
    this.shouldBeOk '0'

  it '3.p', ->
    this.shouldBeOk '0'

  it '4.p', ->
    this.shouldBeOk '0'

  it 'c.0.p', ->
    this.shouldBeOk '0'

  it 'c.1.p', ->
    this.shouldBeOk '0'

  it 'c.2.p', ->
    this.shouldBeOk '0'

  it 'c.3.p', ->
    this.shouldBeOk '0'

  it 'c.4.p', ->
    this.shouldBeOk '0'

  it 's.0.p', ->
    this.shouldBeOk '0'

  it 's.1.p', ->
    this.shouldBeOk '0'

  it 's.2.p', ->
    this.shouldBeOk '0'

  it 's.3.p', ->
    this.shouldBeOk '0'

  it 's.4.p', ->
    this.shouldBeOk '0'
