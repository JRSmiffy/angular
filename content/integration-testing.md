## Integration Testing
* Overview
    * 3 main uses of Integration Testing in Angular are:
        * Testing templates
        * Testing directives
        * Testing navigation
    * As with Unit Testing, we can structure our tests using the 'Arrange, Act, Assert' methodology.
    * For this section, my examples can be found in ```../exercises/exericse-int-testing/examples```
    * When it comes to organising our unit and integration tests, we can put both unit and integration test in the same ```.spec``` file - but this is noisy and confusing.
        * It is better practise to leave your integration tests in the CLI-generated ```*.spec.ts``` file and move your unit tests to a ```*.unit.spec.ts``` file.
* Set Up
    * The ```TestBed``` class provides us with a number of utility functions for setting up integration tests.
        * In ```beforeEach()```, instead of creating a ```new VoterComponent()``` directly, we ask Angular to create one for us. 
            * We do this by using ```TestBed.configureTestingModule({...})``` and passing our component into it - this is similar to providing it in ```app.module.ts```.
            * Then we use ```TestBed.createComponent(...)``` to return a ```ComponentFixture<VoterComponent>```.
                * The ```ComponentFixture<>``` is a wrapper around our component, that gives us the component instance but also the native (HTML) element, injected dependencies, etc.
    * example:
        ```typescript
            // voter.component.spec.ts
            describe('VoterComponent', () => {
                let component: VoterComponent;
                let fixture: ComponentFixture<VoterComponent>;

                beforeEach(() => {
                    TestBed.configureTestingModule({
                        declarations: [VoterComponent]
                    });

                    fixture = TestBed.createComponent(VoterComponent);
                    component = fixture.componentInstance;
                    // nativeElement = fixture.nativeElement;
                    // debugElement = fixture.debugElement;
                });

                it('', () => {
                });
            });
        ```
    * Note, when we use the Angular CLI to generate a component (```ng g c <COMPONENT>```), a 'spec' file is automatically generated with similar setup code to the above - for running integration tests. 
        * The difference being, the ```beforeEach()``` block is separated in two, with one making an ```async ```call to the file system. The compilation of the component (template, etc) is separated and made ```async``` because it is relatively slow to perform this operation.
            * Note, this ```compileComponents``` call is actually not required because using the Angular CLI, with webpack, handles this for us. Therefore we can use the simpler set up in the example above. In truth, it doesn't matter which ooption you take - if using the Angular CLI, you may as well leave things as they are.
* Testing Property Bindings
    * example:
        ```typescript
            // voter.component.spec.ts
            ...
            it('should render total votes', () => {
                component.othersVote = 20;
                component.myVote = 1;
                fixture.detectChanges(); 
                // ^Angular is not running its usual change detection in the test env
                    // so we need to call it manually

                let de = fixture.debugElement.query(By.css('.vote-count'));
                let el: HTMLElement = de.nativeElement;

                expect(el.innerText).toContain('' + 21);
            });

            it('should highlight the upvote button if I have upvoted', () => {
                component.myVote = 1;
                fixture.detectChanges();

                let de = fixture.debugElement.query(By.css('.glyphicon-menu-up'));

                expect(de.classes['highlighted']).toBeTruthy();
            });
        ```
    * Note:
        * A Predicate is a function that returns ```true``` if a certain condition is met.
* Testing Event Bindings
    * We don't need to test all of the execution paths through a method, like we did with unit testing. Rather, we should be checking whether the integration between logical components is behaving as expected. 
    * example:
        ```typescript
            // voter.component.spec.ts
            ...
            it('should increase the total votes when I click the upvote button', () => {
                let button = fixture.debugElement.query(By.css('.glyphicon-menu-up'));
                button.triggerEventHandler('click', null);

                expect(component.totalVotes).toBe(1);
            });
        ```  
        * Note
            * By mistake, I ommited the the ```.``` in ```css('.glyphicon-menu-up')``` and it gave me the following error:
                * ```TypeError: Cannot read properties of null (reading 'triggerEventHandler')```
* Providing Dependencies
    * With Unit Testing, we create a new component object with the ```new``` keyword and then manually passing in the constructor dependencies.
        ```typescript
            ...
            const spy = jasmine.createSpyObj('HttpClient', { post: of({}), get: of({}) })
            service = new TodoService(spy);

            component = new TodosComponent(service);
        ```
        * We can't provide dependencies in this way, with Integration Testing, because we use ```TestBed``` to configure Angular to create a component instance for us.
            * Therefore, if we have to inject a service into our component, we need to register it as a provider in our ```TestBed``` testing module.
            * For depencies like ```HttpClient```, we need to register them in the imports arrays of the ```TestBed``` testing module.
                * example:
                    ```typescript
                        // todos.component.spec.ts
                        ...
                        beforeEach(async(() => {
                            TestBed.configureTestingModule({
                                imports: [ HttpClientModule ],
                                declarations: [ TodosComponent ],
                                providers: [ TodoService ]
                            })
                            .compileComponents();
                        }));
                    ```
* Getting Dependencies
    * When using ```ngOnit()```, we need to make sure that to use ```implements OnInit```, else the method will not be called as part of the lifecyle hooks. Unit testing ```ngOnit()``` will tell us if the functionality is correct but Integration testing is required to ensure that it is running.
    * We may wish to get a dependency in order to change its implementation using a spy.
        * If registered as an import/provider in the testing module, we can use: ```TestBed.get(<DEPENDENCY>);```
        * Note:
            * When we register a service in the 'providers' section of ```app.module.ts```, there exists only one instance of this service across the whole application (Singleton pattern). 
            * This is fine for most situations but we can have a service instance per component, by registering the provider at the component-level (in the component metadata). 
                * We should only do this when specifically required, as it increases complexity unnecessarily and means that the dependency is not available in ```TestBed.get(<DEPENDENCY>);``` - these dependencies must be registered at the module-level.
                    * To get such a dependency in our test, we must use:
                        * ```fixture.debugElement.injector.get(<DEPENDENCY>)```
    * Note:
        * ```TestBed.get()``` has been deprecated in favour of ```TestBed.inject()```
            * Stack Overflow [post](https://stackoverflow.com/questions/56776234/whats-the-difference-between-testbed-get-and-new-service-dependencies)
        * rxjs: ```of``` vs ```from``` Stack Overflow [post](https://stackoverflow.com/questions/42704552/of-vs-from-operator)
    * example:
        ```typescript
            // todos.component.spec.ts
            describe('TodosComponent', () => {
                let component: TodosComponent;
                let fixture: ComponentFixture<TodosComponent>;

                beforeEach(async(() => {
                    TestBed.configureTestingModule({
                        imports: [ HttpClientModule ],
                        declarations: [ TodosComponent ],
                        providers: [ TodoService ]
                    })
                    .compileComponents();
                 }));

                beforeEach(() => {
                    fixture = TestBed.createComponent(TodosComponent);
                    component = fixture.componentInstance;
                    // fixture.detectChanges(); 
                    // ^we need to remove this
                        // as ngOnInit is triggered here
                        // and so our spy in the test will be too late to have an effect
                });

                it('should create', () => {
                    expect(component).toBeTruthy();
                });

                it('should load todos from the server', () => {
                    let service = TestBed.inject(TodoService);
                    spyOn(service, 'getTodos').and.returnValue(of([ 1, 2, 3 ]));

                    fixture.detectChanges();

                    expect(component.todos.length).toBe(3);
                });
            });
        ```
* Providing Stubs
    * We would look to use Stubs when testing navigation that uses a router.
        * A stub allows us to provide a fake implementation of a dependency, which would otherwise unnecessarily increase the complexity of our test setup.
    * To register a stub as a provider in the testing module we need to use a specific syntax:
        * example:
            * ```{ provide: Router, useClass: RouterStub }```
    * example:
        ```typescript
            // user-details.component.spec.ts
            class RouterStub {
                navigate(params: any) { }
                // we need only include the members that are used in our component under test
            }

            class ActivatedRouteStub {
                params: Observable<any> = EMPTY;
                // we need only include the members that are used in our component under test
            }

            describe('UserDetailsComponent', () => {
                let component: UserDetailsComponent;
                let fixture: ComponentFixture<UserDetailsComponent>;

                beforeEach(async(() => {
                    TestBed.configureTestingModule({
                    declarations: [ UserDetailsComponent ],
                    providers: [ 
                        { provide: Router, useClass: RouterStub },
                        { provide: ActivatedRoute, useClass: ActivatedRouteStub }
                    ]
                    })
                    .compileComponents();
                }));

                beforeEach(() => {
                    fixture = TestBed.createComponent(UserDetailsComponent);
                    component = fixture.componentInstance;
                    fixture.detectChanges();
                });

                it('should create', () => {
                    expect(component).toBeTruthy();
                });
            });
        ```
* Testing the Navigation
    * One way to test a component method that uses a router for navigation is to use an interaction test; where we test to see if the dependency (the router) is called with the right arguments - we did the same thing when unit testing components that used services.
        * We need to write two tests for this however. One to check that the method interacts with the router properly and one to check that the route actually exists. This second test should be in an ```app.routes.spec.ts``` file.
    * example:
        ```typescript
            // user-details.component.spec.ts
            ...
            it('should redirect the user to the users page after saving', () => {
                let router = TestBed.inject(Router);
                let spy = spyOn(router, 'navigate');

                component.save();

                expect(spy).toHaveBeenCalledWith(['users']);
            });

            // app.routes.spec.ts
            describe('routes', () => {
                it('should contain a route for /users', () => {
                    expect(routes).toContain({ path: 'users', component: UsersComponent })
                });
            })
        ```
* Dealing with Route Params
    * We cannot push a new value into an Observable that already exists, to overcome this we must use the ```Subject()``` class from ```rxjs```.
        * TypeScript is throwing an error becuase we've added properties to ```ActivatedRouteStub``` that are not present in ```ActivatedRoute```:
            * ```error TS2739: Type 'ActivatedRoute' is missing the following properties from type 'ActivatedRouteStub': subject, push```
                * from this line: ```let route: ActivatedRouteStub = TestBed.inject(ActivatedRoute);```
        * I believe this is a safety feature in newer versions of TypeScript because it works for Mosh. 
            * I tried to add to an Observable using different ```rxjs``` functions but to no avail.
            * I will document what Mosh suggested but if I need to integration test route params in the future, I will need to do some proper research into it.
                * Ideas for further investigation:
                    * Stack Overflow [post 1](https://stackoverflow.com/questions/42052225/how-to-unit-test-angular-2-routing-params)
                    * Stack Overflow [post 2](https://stackoverflow.com/questions/58089326/can-i-add-pipes-to-an-existing-observable)
    * example:
        ```typescript
            // user-details.component.spec.ts
            ...
            class ActivatedRouteStub  {
                private subject = new Subject();

                push(value: any) {
                    this.subject.next(value);
                }

                get params() {
                    return this.subject.asObservable();
                }

                // params: Observable<any> = EMPTY;
                // ^ we define params as a getter so that we can use the subject instead
                    // this is required as params (a standard Observable) can't have a new element added to it
                    // we need to use rxjs's Subject() instead
            }

            describe('UserDetailsComponent', () => {
                ...

                xit('should navigate the user to the not found page when an invalid user id is passed', () => {
                    let router = TestBed.inject(Router);
                    let spy = spyOn(router, 'navigate');

                    let route: ActivatedRouteStub = TestBed.inject(ActivatedRoute);
                    route.push({ id: 0 });
                    // ^ this method throws a TS error

                    // let param = of({ id: 0 });
                    // route.params.pipe(tap(param));
                    // ^ this method did not work either 

                    expect(spy).toHaveBeenCalledWith(['not-found']);
                });
            });
        ```
* Testing RouterOutlet Components
    * When testing components that use a router outlet, we should write two tests:
        * one to see if the ```<router-outlet>``` has been added to the template and another to check that each link in the navigation bar has been set up correctly.
            * Note, we need to import the ```RouterTestingModule``` into our ```TestBed``` Testing Module.
    * Note, it is good practise to purposefully break your test when writting it to make sure that it is testing the part of the system that you want it to.
        * In this example, we can comment out the ```<router-outlet>``` directive in our tempate and this will break our ```'should have a router outlet'``` test - if it doesn't, we know our test is not testing the right thing.
    * example:
        ```typescript
            // app.component.spec.ts
            describe('AppComponent', () => {
                let component: AppComponent;
                let fixture: ComponentFixture<AppComponent>;

                beforeEach(async () => {
                    await TestBed.configureTestingModule({
                    imports: [
                        RouterTestingModule
                    ],
                    ...
                });

                it('should have a router outlet', () => {
                    let de = fixture.debugElement.query(By.directive(RouterOutlet));

                    expect(de).not.toBeNull();
                })

                it('should have a link to todos page', () => {
                    let debugElements = fixture.debugElement.queryAll(By.directive(RouterLinkWithHref));
                    
                    // let index = debugElements.findIndex(de => de.properties['href'] === '/todos'); 
                    // ^ Mosh suggests looking at .properties['href'] but it appears to be blank
                        // I wonder if things have changed in Angular since then
                    let index = debugElements.findIndex(de => de.attributes['routerLink'] === 'todos'); 

                    expect(index).toBeGreaterThan(-1);
                })
            });
        ```
* Shallow Component Tests
    * We use components to create encapsulated, reusable views; if we decide to extract our ```<nav>``` element from ```app.component.html```, into a ```NavBarComponent```, we get an error:
        * ```ERROR: 'NG0304: 'nav-bar' is not a known element```
            * We have two options to deal this this:
                1. Add NavBar in the 'declarations' of our ```TestBed``` Testing Module
                2. Ignore unknown elements by adding a 'schema' to our ```TestBed``` Testing Module
                    * ```schemas: [ NO_ERRORS_SCHEMA ]```
                    * You would use this if you have a very complex template with lots of child components.
        * In this situation, I moved the nav-specific tests into ```nav-bar.component.spec.ts``` and added ```NavBarComponent``` to the ```declarations: []``` in ```app.component.spec.ts```.
        * Who tests the tester?
            * I spent a fair chunk of time debugging an empty array ```[]``` from ```let debugElements = fixture.debugElement.queryAll(By.directive(RouterLinkWithHref));```
                * It turns out I had forgotten to import ```RouterTestingModule``` in my ```nav-bar.component.spec.ts```'s ```TestBed``` - instead of throwing an error, I just got an empty array ```[]```. Without this module imported, the directive will not be executed.
                    * Be careful out there.
* Testing Attribute Directives
    * When testing attribute directives, we should create a ```DirectiveHostComponent``` in our 'spec' file to test the various different usages of our attribute.
    * Remember to add both the directive component and the host directive component to the testing module's ```declarations: []``` - without these the directives will not be applied, as Angular will ignore attribute directives that it doesn't recognise.
    * example:
        ```typescript
            // highlight.directive.spec.ts
            @Component({
                template: `
                    <p highlight="cyan">First</p>
                    <p highlight>Second</p>
                `
            })
            class DirectiveHostComponent { }

            describe('HighlightDirective', () => {
                let fixture: ComponentFixture<DirectiveHostComponent>;
                
                beforeEach(async(() => {
                    TestBed.configureTestingModule({
                    declarations: [ DirectiveHostComponent, HighlightDirective ]
                    })
                    .compileComponents();
                }));

                ...

                it('should highlight the first element with cyan', () => {
                    let de = fixture.debugElement.queryAll(By.css('p'))[0];

                    expect(de.nativeElement.style.backgroundColor).toBe('cyan');
                });

                it('should highlight the first element with the default colour', () => {
                    let de = fixture.debugElement.queryAll(By.css('p'))[1];
                    let directive = de.injector.get(HighlightDirective);
                    
                    expect(de.nativeElement.style.backgroundColor).toBe(directive.defaultColor);
                });
            });
        ```
* Dealing with Asynchronous Operations
    * What is a Promise?
        * A Promise is an object that represents the eventual completion of an async operation and its resulting value.
        * MDN [docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
    * When we read a Promise using ```then```, the JS execution engine puts that task in a queue to be performed once the current execution thread has finished. For our tests, this means that Promise's will not be opened when before we run ```fixture.detectChanges();``` - unlike Observables, which are.
        * We have two options to fix this:
            1. Wrap the test function with ```async()``` and then wrap our ```expect()``` assertion inside a ```fixture.whenStable().then({ })``` block
            2. Wrap the test function with ```fakeAsync()``` and use ```tick();```
        * I am not sure which one is best practise but #2 looks neater. 
    * example:
        ```typescript
            // todos.component.spec.ts
            describe('TodosComponent', () => {
                ...

                it('should load todos from the server, using async()', async(() => {
                    let service = TestBed.inject(TodoService);
                    spyOn(service, 'getTodosPromise').and.returnValue(Promise.resolve([ 1, 2, 3 ]));

                    fixture.detectChanges();

                    fixture.whenStable().then(() => {
                        expect(component.todos.length).toBe(3);
                    })
                }));

                it('should load todos from the server, using fakeAsync()', fakeAsync(() => {
                    let service = TestBed.inject(TodoService);
                    spyOn(service, 'getTodosPromise').and.returnValue(Promise.resolve([ 1, 2, 3 ]));

                    fixture.detectChanges();

                    tick();
                    expect(component.todos.length).toBe(3);
                }));
            });
        ```