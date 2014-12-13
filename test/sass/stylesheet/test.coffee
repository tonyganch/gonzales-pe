describe 'sass/stylesheet >>', ->
  beforeEach -> this.filename = __filename

  it '0', -> this.shouldBeOk()
  it.skip '1', -> this.shouldBeOk()
  it.skip '2', -> this.shouldBeOk()
  it '3', -> this.shouldBeOk()
  it.skip '4', -> this.shouldBeOk()
  it.skip '5', -> this.shouldBeOk()
  it.skip '6', -> this.shouldBeOk()

  it.skip 'c.0', -> this.shouldBeOk()

  it.skip 'issue86.test1', -> this.shouldBeOk()
  it.skip 'issue87.test1', -> this.shouldBeOk()
  it.skip 'issue88.test1', -> this.shouldBeOk()
  it.skip 'issue90.test1', -> this.shouldBeOk()

  it.skip 's.0', -> this.shouldBeOk()
  it.skip 's.1', -> this.shouldBeOk()
  it 's.2', -> this.shouldBeOk()
  it.skip 's.3', -> this.shouldBeOk()
