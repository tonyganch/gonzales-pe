describe 'sass/function >>', ->
  beforeEach -> this.filename = __filename

  it '0', -> this.shouldBeOk()
  it.skip '1', -> this.shouldBeOk()
  it '2', -> this.shouldBeOk()
  it '3', -> this.shouldBeOk()
  it '4', -> this.shouldBeOk()
  it '5', -> this.shouldBeOk()

  it.skip 'c.0', -> this.shouldBeOk()
  it.skip 'c.1', -> this.shouldBeOk()
  it.skip 'c.2', -> this.shouldBeOk()
  it.skip 'c.3', -> this.shouldBeOk()
  it.skip 'c.4', -> this.shouldBeOk()
  it.skip 'c.5', -> this.shouldBeOk()

  it 's.0', -> this.shouldBeOk()
  it 's.1', -> this.shouldBeOk()
  it 's.2', -> this.shouldBeOk()
  it 's.3', -> this.shouldBeOk()
  it 's.4', -> this.shouldBeOk()
  it 's.5', -> this.shouldBeOk()
