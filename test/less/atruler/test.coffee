describe.skip 'less/atruler >>', ->
  beforeEach ->
    this.filename = __filename

  it '0.p', ->
    this.shouldBeOk '0'

  it '1.p', ->
    this.shouldBeOk '1'

  it '2.p', ->
    this.shouldBeOk '2'

  it.skip 'c.0.p', ->
    this.shouldBeOk 'c.0'

  it.skip 'c.1.p', ->
    this.shouldBeOk 'c.1'

  it.skip 'c.2.p', ->
    this.shouldBeOk 'c.2'

  it 'keyframes.0.p', ->
    this.shouldBeOk 'keyframes.0'

  it.skip 's.0.p', ->
    this.shouldBeOk 's.0'

  it.skip 's.1.p', ->
    this.shouldBeOk 's.1'

  it.skip 's.2.p', ->
    this.shouldBeOk 's.2'

