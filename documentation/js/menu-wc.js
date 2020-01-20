'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">RCN Credit Marketplace - Documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="changelog.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CHANGELOG
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/ActiveLoansModule.html" data-type="entity-link">ActiveLoansModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-ActiveLoansModule-efc609beb3577c4b98a376e6c2196f37"' : 'data-target="#xs-components-links-module-ActiveLoansModule-efc609beb3577c4b98a376e6c2196f37"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-ActiveLoansModule-efc609beb3577c4b98a376e6c2196f37"' :
                                            'id="xs-components-links-module-ActiveLoansModule-efc609beb3577c4b98a376e6c2196f37"' }>
                                            <li class="link">
                                                <a href="components/ActiveLoansComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ActiveLoansComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-ActiveLoansModule-efc609beb3577c4b98a376e6c2196f37"' : 'data-target="#xs-injectables-links-module-ActiveLoansModule-efc609beb3577c4b98a376e6c2196f37"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ActiveLoansModule-efc609beb3577c4b98a376e6c2196f37"' :
                                        'id="xs-injectables-links-module-ActiveLoansModule-efc609beb3577c4b98a376e6c2196f37"' }>
                                        <li class="link">
                                            <a href="injectables/ContractsService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ContractsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AddressModule.html" data-type="entity-link">AddressModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AddressModule-94fbc8be79f142aae7b74768b8c4485b"' : 'data-target="#xs-components-links-module-AddressModule-94fbc8be79f142aae7b74768b8c4485b"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AddressModule-94fbc8be79f142aae7b74768b8c4485b"' :
                                            'id="xs-components-links-module-AddressModule-94fbc8be79f142aae7b74768b8c4485b"' }>
                                            <li class="link">
                                                <a href="components/AddressComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AddressComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AddressModule-94fbc8be79f142aae7b74768b8c4485b"' : 'data-target="#xs-injectables-links-module-AddressModule-94fbc8be79f142aae7b74768b8c4485b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AddressModule-94fbc8be79f142aae7b74768b8c4485b"' :
                                        'id="xs-injectables-links-module-AddressModule-94fbc8be79f142aae7b74768b8c4485b"' }>
                                        <li class="link">
                                            <a href="injectables/ContractsService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ContractsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-d8f1d26e12f9052e41648aa657598107"' : 'data-target="#xs-components-links-module-AppModule-d8f1d26e12f9052e41648aa657598107"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-d8f1d26e12f9052e41648aa657598107"' :
                                            'id="xs-components-links-module-AppModule-d8f1d26e12f9052e41648aa657598107"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link">AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/CoreModule.html" data-type="entity-link">CoreModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-CoreModule-13bf40de29501816cf5507c8a507c10a"' : 'data-target="#xs-components-links-module-CoreModule-13bf40de29501816cf5507c8a507c10a"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-CoreModule-13bf40de29501816cf5507c8a507c10a"' :
                                            'id="xs-components-links-module-CoreModule-13bf40de29501816cf5507c8a507c10a"' }>
                                            <li class="link">
                                                <a href="components/BalanceComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">BalanceComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ContentWrapperComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ContentWrapperComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HeaderComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">HeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IconGroupHeaderComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">IconGroupHeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NotificationItemComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">NotificationItemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NotificationsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">NotificationsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SocialContainerComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SocialContainerComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-CoreModule-13bf40de29501816cf5507c8a507c10a"' : 'data-target="#xs-directives-links-module-CoreModule-13bf40de29501816cf5507c8a507c10a"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-CoreModule-13bf40de29501816cf5507c8a507c10a"' :
                                        'id="xs-directives-links-module-CoreModule-13bf40de29501816cf5507c8a507c10a"' }>
                                        <li class="link">
                                            <a href="directives/ClickOutsideDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">ClickOutsideDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/LoanDetailModule.html" data-type="entity-link">LoanDetailModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-LoanDetailModule-272c12c18f5f90db9b2fb5b0c7e0daa1"' : 'data-target="#xs-components-links-module-LoanDetailModule-272c12c18f5f90db9b2fb5b0c7e0daa1"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-LoanDetailModule-272c12c18f5f90db9b2fb5b0c7e0daa1"' :
                                            'id="xs-components-links-module-LoanDetailModule-272c12c18f5f90db9b2fb5b0c7e0daa1"' }>
                                            <li class="link">
                                                <a href="components/DecentralandCosignerComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DecentralandCosignerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DecentralandMapComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DecentralandMapComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DetailCosignerComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DetailCosignerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DetailIdentityComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DetailIdentityComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DetailTableComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DetailTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogLoanPayComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogLoanPayComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogLoanTransferComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogLoanTransferComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GobackButtonComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">GobackButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ItemFeatureComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ItemFeatureComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoanDetailComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">LoanDetailComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoanDoesNotExistComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">LoanDoesNotExistComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TransactionHistoryComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TransactionHistoryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TransferButtonComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">TransferButtonComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-LoanDetailModule-272c12c18f5f90db9b2fb5b0c7e0daa1"' : 'data-target="#xs-injectables-links-module-LoanDetailModule-272c12c18f5f90db9b2fb5b0c7e0daa1"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-LoanDetailModule-272c12c18f5f90db9b2fb5b0c7e0daa1"' :
                                        'id="xs-injectables-links-module-LoanDetailModule-272c12c18f5f90db9b2fb5b0c7e0daa1"' }>
                                        <li class="link">
                                            <a href="injectables/CommitsService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>CommitsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ContractsService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ContractsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CosignerService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>CosignerService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MaterialModule.html" data-type="entity-link">MaterialModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/NotFoundModule.html" data-type="entity-link">NotFoundModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-NotFoundModule-1601b6ed65be5c2bbca744b5d1c6d558"' : 'data-target="#xs-components-links-module-NotFoundModule-1601b6ed65be5c2bbca744b5d1c6d558"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-NotFoundModule-1601b6ed65be5c2bbca744b5d1c6d558"' :
                                            'id="xs-components-links-module-NotFoundModule-1601b6ed65be5c2bbca744b5d1c6d558"' }>
                                            <li class="link">
                                                <a href="components/NotFoundComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">NotFoundComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/RequestedLoanModule.html" data-type="entity-link">RequestedLoanModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-RequestedLoanModule-989ea6f69fa8d490c8e9363066eca11e"' : 'data-target="#xs-components-links-module-RequestedLoanModule-989ea6f69fa8d490c8e9363066eca11e"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-RequestedLoanModule-989ea6f69fa8d490c8e9363066eca11e"' :
                                            'id="xs-components-links-module-RequestedLoanModule-989ea6f69fa8d490c8e9363066eca11e"' }>
                                            <li class="link">
                                                <a href="components/RequestedLoanComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">RequestedLoanComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-RequestedLoanModule-989ea6f69fa8d490c8e9363066eca11e"' : 'data-target="#xs-injectables-links-module-RequestedLoanModule-989ea6f69fa8d490c8e9363066eca11e"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RequestedLoanModule-989ea6f69fa8d490c8e9363066eca11e"' :
                                        'id="xs-injectables-links-module-RequestedLoanModule-989ea6f69fa8d490c8e9363066eca11e"' }>
                                        <li class="link">
                                            <a href="injectables/ContractsService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ContractsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/FilterLoansService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>FilterLoansService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SharedModule.html" data-type="entity-link">SharedModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-SharedModule-30b0fd422317932f7ccd97a7a42114f2"' : 'data-target="#xs-components-links-module-SharedModule-30b0fd422317932f7ccd97a7a42114f2"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SharedModule-30b0fd422317932f7ccd97a7a42114f2"' :
                                            'id="xs-components-links-module-SharedModule-30b0fd422317932f7ccd97a7a42114f2"' }>
                                            <li class="link">
                                                <a href="components/AvatarComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AvatarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AvatarTitleComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AvatarTitleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BodyListComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">BodyListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ButtonGroupComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ButtonGroupComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ClaimButtonComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ClaimButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CloseButtonComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CloseButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConversionGraphicComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ConversionGraphicComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CosignerSelectorComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CosignerSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CreatorContainerComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CreatorContainerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CurrencyLogoComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CurrencyLogoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DetailButtonComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DetailButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogApproveContractComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogApproveContractComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogClientAccountComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogClientAccountComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogGenericErrorComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogGenericErrorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogHeaderComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogHeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogInsufficientfundsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogInsufficientfundsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogLoanLendComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogLoanLendComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DialogWrongCountryComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">DialogWrongCountryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ErrorDetailsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ErrorDetailsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FilterLoansComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FilterLoansComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FooterComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FooterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HeaderListComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">HeaderListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IconAvatarComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">IconAvatarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InfiniteProgressBarComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">InfiniteProgressBarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LendButtonComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">LendButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoanAvatarComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">LoanAvatarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoanCardComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">LoanCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PayButtonComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">PayButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RiskIndicatorComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">RiskIndicatorComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-SharedModule-30b0fd422317932f7ccd97a7a42114f2"' : 'data-target="#xs-injectables-links-module-SharedModule-30b0fd422317932f7ccd97a7a42114f2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SharedModule-30b0fd422317932f7ccd97a7a42114f2"' :
                                        'id="xs-injectables-links-module-SharedModule-30b0fd422317932f7ccd97a7a42114f2"' }>
                                        <li class="link">
                                            <a href="injectables/BrandingService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>BrandingService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ContractsService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ContractsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CosignerService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>CosignerService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CountriesService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>CountriesService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DecentralandCosignerProvider.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>DecentralandCosignerProvider</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/EventsService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>EventsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/IdentityService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>IdentityService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RiskService.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>RiskService</a>
                                        </li>
                                    </ul>
                                </li>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#pipes-links-module-SharedModule-30b0fd422317932f7ccd97a7a42114f2"' : 'data-target="#xs-pipes-links-module-SharedModule-30b0fd422317932f7ccd97a7a42114f2"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-SharedModule-30b0fd422317932f7ccd97a7a42114f2"' :
                                            'id="xs-pipes-links-module-SharedModule-30b0fd422317932f7ccd97a7a42114f2"' }>
                                            <li class="link">
                                                <a href="pipes/FormatAmountPipe.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">FormatAmountPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/VisualUrlPipe.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">VisualUrlPipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/Brand.html" data-type="entity-link">Brand</a>
                            </li>
                            <li class="link">
                                <a href="classes/CompanyIdentity.html" data-type="entity-link">CompanyIdentity</a>
                            </li>
                            <li class="link">
                                <a href="classes/Config.html" data-type="entity-link">Config</a>
                            </li>
                            <li class="link">
                                <a href="classes/Contract.html" data-type="entity-link">Contract</a>
                            </li>
                            <li class="link">
                                <a href="classes/Cosigner.html" data-type="entity-link">Cosigner</a>
                            </li>
                            <li class="link">
                                <a href="classes/CosignerDetail.html" data-type="entity-link">CosignerDetail</a>
                            </li>
                            <li class="link">
                                <a href="classes/CosignerLiability.html" data-type="entity-link">CosignerLiability</a>
                            </li>
                            <li class="link">
                                <a href="classes/CosignerOffer.html" data-type="entity-link">CosignerOffer</a>
                            </li>
                            <li class="link">
                                <a href="classes/Currency.html" data-type="entity-link">Currency</a>
                            </li>
                            <li class="link">
                                <a href="classes/DataEntry.html" data-type="entity-link">DataEntry</a>
                            </li>
                            <li class="link">
                                <a href="classes/Debt.html" data-type="entity-link">Debt</a>
                            </li>
                            <li class="link">
                                <a href="classes/DecentralandCosigner.html" data-type="entity-link">DecentralandCosigner</a>
                            </li>
                            <li class="link">
                                <a href="classes/Descriptor.html" data-type="entity-link">Descriptor</a>
                            </li>
                            <li class="link">
                                <a href="classes/District.html" data-type="entity-link">District</a>
                            </li>
                            <li class="link">
                                <a href="classes/Feature.html" data-type="entity-link">Feature</a>
                            </li>
                            <li class="link">
                                <a href="classes/Identity.html" data-type="entity-link">Identity</a>
                            </li>
                            <li class="link">
                                <a href="classes/Loan.html" data-type="entity-link">Loan</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoanCurator.html" data-type="entity-link">LoanCurator</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoanUtils.html" data-type="entity-link">LoanUtils</a>
                            </li>
                            <li class="link">
                                <a href="classes/Model.html" data-type="entity-link">Model</a>
                            </li>
                            <li class="link">
                                <a href="classes/Notification.html" data-type="entity-link">Notification</a>
                            </li>
                            <li class="link">
                                <a href="classes/Operator.html" data-type="entity-link">Operator</a>
                            </li>
                            <li class="link">
                                <a href="classes/Oracle.html" data-type="entity-link">Oracle</a>
                            </li>
                            <li class="link">
                                <a href="classes/Parcel.html" data-type="entity-link">Parcel</a>
                            </li>
                            <li class="link">
                                <a href="classes/RavenErrorHandler.html" data-type="entity-link">RavenErrorHandler</a>
                            </li>
                            <li class="link">
                                <a href="classes/Tag.html" data-type="entity-link">Tag</a>
                            </li>
                            <li class="link">
                                <a href="classes/Tx.html" data-type="entity-link">Tx</a>
                            </li>
                            <li class="link">
                                <a href="classes/TxObject.html" data-type="entity-link">TxObject</a>
                            </li>
                            <li class="link">
                                <a href="classes/UnknownCosigner.html" data-type="entity-link">UnknownCosigner</a>
                            </li>
                            <li class="link">
                                <a href="classes/UnknownCosignerProvider.html" data-type="entity-link">UnknownCosignerProvider</a>
                            </li>
                            <li class="link">
                                <a href="classes/Utils.html" data-type="entity-link">Utils</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/ApiService.html" data-type="entity-link">ApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AvailableLoansService.html" data-type="entity-link">AvailableLoansService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CurrenciesService.html" data-type="entity-link">CurrenciesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificationsService.html" data-type="entity-link">NotificationsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PreviousRouteService.html" data-type="entity-link">PreviousRouteService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SidebarService.html" data-type="entity-link">SidebarService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TitleService.html" data-type="entity-link">TitleService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TxService.html" data-type="entity-link">TxService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/Web3Service.html" data-type="entity-link">Web3Service</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/BestInterestRate.html" data-type="entity-link">BestInterestRate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Commit.html" data-type="entity-link">Commit</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CosignerOption.html" data-type="entity-link">CosignerOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CosignerProvider.html" data-type="entity-link">CosignerProvider</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CurrencyItem.html" data-type="entity-link">CurrencyItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ErrorButton.html" data-type="entity-link">ErrorButton</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Filters.html" data-type="entity-link">Filters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Filters-1.html" data-type="entity-link">Filters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoanApiBasalt.html" data-type="entity-link">LoanApiBasalt</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoanApiDiaspore.html" data-type="entity-link">LoanApiDiaspore</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ModelConfig.html" data-type="entity-link">ModelConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ModelDebtInfo.html" data-type="entity-link">ModelDebtInfo</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});