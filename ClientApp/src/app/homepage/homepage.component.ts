import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { Subscription } from 'rxjs';
import { Dictionary, overArgs } from 'lodash';
import { Colony } from '../colony';
import * as _ from 'underscore';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit, OnDestroy {

  constructor(private apollo: Apollo) {
    //this.updateBeeCount = _.debounce(this.updateBeeCount, 200);
    //this.updateHiveCount = _.debounce(this.updateHiveCount, 200);
  }

  private querySubscription: Subscription;
  colonyList: Colony[] = [];
  loading: boolean = false;
  overProduction: Dictionary<any> = {}

  ngOnInit(): void {
    this.getColonies();
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }

  calculateNextCollectionDate(colony: Colony) {
    if (colony.collectionInfo.length === 0) {
      return new Date();
    } else {
      let date = new Date(colony.collectionInfo[colony.collectionInfo.length - 1].collection_date);
      return date.setDate(date.getDate() + 6);
    }
  }

  isOverProduced(colonyId) {
    return this.overProduction[colonyId] >= 150 ? true : false;
  }

  collect(colony: Colony) {
    let honeyCollected = this.overProduction[colony.id];
    let collectionDate = new Date();

    if (honeyCollected > 0) {
      const GET_COLONIES = gql`
        {
          colony(order_by: { created_at: asc }) {
            id
            name
            bee_count
            hive_count
            created_at
            collectionInfo(order_by: { collection_date: asc }) {
              collection_date
              collection_amount
            }
          }
        }
        `;

      const ADD_COLLECTION = gql`
        mutation ($_colonyId: Int!, $_collection_date: date!, $_collection_amount: numeric!) {
          insert_collectionInfo(objects: {
            colony_id: $_colonyId,
            collection_date: $_collection_date,
            collection_amount: $_collection_amount
          }) {
            affected_rows
            returning {
              id,
              colony_id,
              collection_date,
              collection_amount
            }
          }
        }
        `;

      this.apollo.mutate({
        mutation: ADD_COLLECTION,
        variables: { _colonyId: colony.id, _collection_date: collectionDate, _collection_amount: honeyCollected },
        refetchQueries: [
          { query: GET_COLONIES }
        ]
      }).subscribe((data: any) => {
        console.log("UPLOADED");
      }, (error) => {
        console.log("There was an error", error);
      });
    }
  }

  calculateOverProduction(colony: Colony) {
    const currentTime = new Date();
    let collectedTime: Date;
    if (colony.collectionInfo.length > 0) {
      collectedTime = new Date(colony.collectionInfo[colony.collectionInfo.length - 1].collection_date);
    } else {
      collectedTime = new Date(colony.created_at);
    }

    const differenceInTime = Math.abs(currentTime.getDate() - collectedTime.getDate());
    const diff = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    let overProduction = (colony.bee_count / colony.hive_count) * diff * 0.26;

    return overProduction;
  }

  updateBeeCount(colony: Colony, beeCount) {
    const UPDATE_BEE_COUNT = gql`
      mutation ($id: Int!, $_bee_count: numeric!) {
        update_colony(where: {id: {_eq: $id}}, _set: {
          bee_count: $_bee_count
        }) {
          affected_rows
          returning {
            id,
            name,
            bee_count,
            hive_count
          }
        }
      }
    `;

    this.apollo.mutate({
      mutation: UPDATE_BEE_COUNT,
      variables: { id: colony.id, _bee_count: beeCount },
    }).subscribe(({ data }) => {
      console.log('got data', data);
      this.overProduction[colony.id] = this.calculateOverProduction(colony);
    }, (error) => {
      console.log('There was an error with the query', error);
    });
  }

  updateHiveCount(colony: Colony, hiveCount) {
    const UPDATE_BEE_COUNT = gql`
      mutation ($id: Int!, $_hive_count: numeric!) {
        update_colony(where: {id: {_eq: $id}}, _set: {
          hive_count: $_hive_count
        }) {
          affected_rows
          returning {
            id,
            name,
            bee_count,
            hive_count
          }
        }
      }
    `;

    this.apollo.mutate({
      mutation: UPDATE_BEE_COUNT,
      variables: { id: colony.id, _hive_count: hiveCount },
    }).subscribe(({ data }) => {
      console.log('got data', data);
      this.overProduction[colony.id] = this.calculateOverProduction(colony);
    }, (error) => {
      console.log('There was an error with the query', error);
    });
  }

  getCollectedAmount(colony: Colony) {
    if (colony.collectionInfo.length == 0) {
      return 0;
    } else {
      let amount = 0;

      for (let i = 0; i < colony.collectionInfo.length; i++) {
        amount += colony.collectionInfo[i].collection_amount;
      }
      return amount;
    }
  }

  getLastCollectionDate(colony: Colony) {
    if (colony.collectionInfo.length == 0) {
      return 0;
    } else {
      return colony.collectionInfo[colony.collectionInfo.length - 1].collection_date;
    }
  }

  getCollectionCount(colony: Colony) {
    if (colony.collectionInfo.length == 0) {
      return 0;
    } else {
      // TODO: FIX THE COUNT JUST TO .length - 1!
      let i = 0;
      for (let collection in colony.collectionInfo) {
        i++;
      }
      return i;
    }
  }

  getColonies() {
    this.loading = true;

    const GET_COLONIES = gql`
     {
        colony(order_by: { created_at: asc }) {
          id
          name
          bee_count
          hive_count
          created_at
          collectionInfo(order_by: { collection_date: asc }) {
            collection_date
            collection_amount
          }
        }
      }
    `;

    this.querySubscription = this.apollo
      .watchQuery<any>({
        query: GET_COLONIES
      })
      .valueChanges
      .subscribe(({ data, loading }) => {
        this.loading = loading;
        this.colonyList = data.colony;

        for (let i = 0; i < this.colonyList.length; i++) {
          this.overProduction[this.colonyList[i].id] = this.calculateOverProduction(this.colonyList[i]);
        }
      })
  }
}
